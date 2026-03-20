/**
 * Sensor Tower 내부 API 기반 데이터 수집
 *
 * DOM 스크래핑 대신 내부 REST API 직접 호출:
 *   POST /api/v2/apps/facets — 키워드 랭킹 데이터
 *   GET  /api/app_intel/user_apps — 등록 앱 목록
 *   GET  /overview/{UAI}/{SSIA} — 앱 개요 (DOM)
 *
 * 세션 쿠키 + CSRF 토큰으로 인증
 */
import { chromium } from 'playwright';
import { config } from './config.js';
import { join } from 'path';
import { existsSync, writeFileSync, mkdirSync } from 'fs';

const AUTH_STATE_FILE = join(config.paths.authState, 'st-session.json');
const SCREENSHOT_DIR = config.paths.screenshots;

const ST = {
  uai: '564d5f563fc720868c00859b',
  baseUrl: 'https://app.sensortower.com',
  views: {
    ios: {
      appId: '1270676408',
      viewId: '6980555e58005572eb4d657d',
      os: 'ios',
      device: 'iphone',
    },
    android: {
      appId: 'com.mathpresso.qanda',
      viewId: '698445d12d94188f03a79a7c',
      os: 'android',
      device: 'android',
    },
  },
};

/**
 * 키워드 API POST body 생성
 */
function makeKeywordBody(view) {
  const today = new Date();
  const endDate = today.toISOString().slice(0, 10);
  const startDate = new Date(today - 90 * 86400000).toISOString().slice(0, 10);
  const compStartDate = new Date(today - 180 * 86400000).toISOString().slice(0, 10);
  const compEndDate = new Date(today - 91 * 86400000).toISOString().slice(0, 10);
  const weekAgo = new Date(today - 7 * 86400000).toISOString().slice(0, 10);

  return {
    breakdowns: [[], ['keyword']],
    facets: [
      { facet: 'keyword', alias: 'keyword' },
      { facet: 'keyword_rank', alias: 'keyword_rank' },
      { facet: 'keyword_rank', measure: 'delta', alias: 'keyword_rank_growth' },
      { facet: 'keyword_traffic', alias: 'keyword_traffic' },
      { facet: 'keyword_difficulty_score', alias: 'keyword_difficulty_score' },
      { facet: 'keyword_opportunity_score', alias: 'keyword_opportunity_score' },
      { facet: 'est_keyword_downloads', alias: 'est_keyword_downloads' },
      { facet: 'est_keyword_downloads_share', alias: 'est_keyword_downloads_share' },
    ],
    filters: {
      keyword_view_id: view.viewId,
      start_date: startDate,
      end_date: endDate,
      comparison_start_date: compStartDate,
      comparison_end_date: compEndDate,
      regions: ['KR'],
      devices: [view.device],
      os: view.os,
      keywords: {
        in: {
          breakdowns: [['keyword']],
          facets: [
            { facet: 'keyword', alias: 'keyword' },
            { facet: 'keyword_traffic', alias: 'keyword_traffic' },
            { facet: 'keyword_rank', alias: 'keyword_rank' },
          ],
          filters: {
            keyword_view_id: view.viewId,
            start_date: weekAgo,
            end_date: endDate,
            comparison_start_date: compStartDate,
            comparison_end_date: compEndDate,
            regions: ['KR'],
            devices: [view.device],
            os: view.os,
          },
          limit: 200,
          offset: 0,
          order_by: [{ keyword_rank: 'asc' }, { keyword_traffic: 'desc' }],
        },
      },
    },
    order_by: [{ keyword_rank: 'asc' }, { keyword_traffic: 'desc' }],
  };
}

/**
 * 브라우저 시작 + CSRF 토큰 획득
 */
async function initBrowser() {
  if (!existsSync(AUTH_STATE_FILE)) {
    throw new Error('세션 파일이 없습니다. 먼저 npm run test-login을 실행하세요.');
  }

  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({
    storageState: AUTH_STATE_FILE,
    acceptDownloads: true,
  });
  const page = await context.newPage();

  // CSRF 토큰 캡처
  let csrfToken = '';
  page.on('request', (req) => {
    const t = req.headers()['x-csrf-token'];
    if (t) csrfToken = t;
  });

  // 메인 페이지 방문으로 세션 활성화 + CSRF 획득
  await page.goto(ST.baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  const url = page.url();
  if (url.includes('sign_in') || url.includes('login')) {
    await browser.close();
    throw new Error('세션이 만료되었습니다. npm run test-login을 다시 실행하세요.');
  }

  // 메타 태그에서도 CSRF 확인
  if (!csrfToken) {
    csrfToken = await page.evaluate(() =>
      document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    );
  }

  if (!csrfToken) {
    await browser.close();
    throw new Error('CSRF 토큰을 획득할 수 없습니다.');
  }

  console.log(`[ST] 로그인 확인 | CSRF: ${csrfToken.slice(0, 20)}...`);
  return { browser, context, page, csrfToken };
}

/**
 * 키워드 랭킹 수집 (내부 API)
 */
async function collectKeywordRankings(page, csrfToken, platform) {
  const view = ST.views[platform];
  console.log(`[ST] ${platform.toUpperCase()} 키워드 API 호출 (viewId: ${view.viewId})...`);

  const body = makeKeywordBody(view);

  const result = await page.evaluate(async ({ body, csrf, appId }) => {
    const res = await fetch(
      `/api/v2/apps/facets?query_identifier=aso_keywords_management_table_${appId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    return { status: res.status, rows: data.data || [], error: data.error || data.message };
  }, { body, csrf: csrfToken, appId: view.appId });

  if (result.error) {
    console.error(`[ST] ${platform.toUpperCase()} API 에러 (${result.status}):`, result.error);
    return {};
  }

  // API 응답 → 키워드별 객체로 변환
  const rankings = {};
  for (const row of result.rows) {
    rankings[row.keyword] = {
      rank: row.keyword_rank ?? null,
      change: row.keyword_rank_growth ?? 0,
      trafficScore: row.keyword_traffic ?? null,
      difficulty: row.keyword_difficulty_score != null
        ? Math.round(row.keyword_difficulty_score * 10) / 10
        : null,
      opportunity: row.keyword_opportunity_score != null
        ? Math.round(row.keyword_opportunity_score * 10) / 10
        : null,
      searchVolume: row.est_keyword_downloads ?? null,
      sharePercent: row.est_keyword_downloads_share != null
        ? Math.round(row.est_keyword_downloads_share * 1000) / 10
        : null,
    };
  }

  console.log(`[ST] ${platform.toUpperCase()} 키워드: ${Object.keys(rankings).length}개`);
  return rankings;
}

/**
 * 카테고리 랭킹 30일 히스토리 수집 (교육 카테고리 — KR)
 * API: GET /api/unified/apps/{uai}/category_rankings?country=KR&date=YYYY-MM-DD
 */
async function collectCategoryRankings(page, csrfToken) {
  console.log('[ST] 카테고리 랭킹 30일 히스토리 수집...');

  const history = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);

    const result = await page.evaluate(async ({ uai, csrf, date }) => {
      const res = await fetch(`/api/unified/apps/${uai}/category_rankings?country=KR&date=${date}`, {
        headers: { 'X-CSRF-Token': csrf },
      });
      if (res.status !== 200) return null;
      return res.json();
    }, { uai: ST.uai, csrf: csrfToken, date });

    if (result) {
      const d = result;
      history.push({
        date,
        iosIphone: d.ios?.iphone?.top_free?.primary_categories?.find(c => c['6017'] != null)?.['6017'] ?? null,
        iosIpad: d.ios?.ipad?.top_free?.primary_categories?.find(c => c['6017'] != null)?.['6017'] ?? null,
        android: d.android?.android?.top_free?.primary_categories?.find(c => c['education'] != null)?.['education'] ?? null,
      });
    }
  }

  const latest = history[history.length - 1];
  console.log(`[ST] 카테고리 랭킹 ${history.length}일 수집 완료`);
  if (latest) {
    console.log(`  최신(${latest.date}): iOS iPhone=${latest.iosIphone}위, Android=${latest.android}위`);
  }

  return history;
}

/**
 * OS별 유입 경로(다운로드 소스) 수집
 * API: GET /v1/{os}/downloads_by_sources
 * 소스 분류: organic(검색+브라우징), browser(웹 레퍼럴), paid(광고)
 */
async function collectDownloadSources(page, csrfToken) {
  console.log('[ST] OS별 유입 경로(다운로드 소스) 수집...');

  const endDate = new Date().toISOString().slice(0, 10);
  const startDate = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);

  const sources = { ios: [], android: [] };

  for (const [platform, view] of Object.entries(ST.views)) {
    const os = platform === 'ios' ? 'ios' : 'android';

    // /api/{os}/downloads_by_sources 엔드포인트 호출
    const result = await page.evaluate(async ({ uai, csrf, startDate, endDate, os }) => {
      try {
        const res = await fetch(
          `/api/${os}/downloads_by_sources?app_ids=${uai}&countries=KR&start_date=${startDate}&end_date=${endDate}&date_granularity=daily`,
          { headers: { 'X-CSRF-Token': csrf } }
        );
        if (res.status === 200) {
          const data = await res.json();
          return { success: true, data };
        }
        return { success: false, status: res.status };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }, { uai: ST.uai, csrf: csrfToken, startDate, endDate, os });

    if (result.success) {
      console.log(`[ST] ${platform.toUpperCase()} 유입 경로 API 성공`);
      const breakdown = result.data?.data?.[0]?.breakdown || [];

      sources[os] = breakdown.map(entry => ({
        date: entry.date,
        organicSearch: entry.organic_search_abs ?? 0,
        organicBrowse: entry.organic_browse_abs ?? 0,
        paidSearch: entry.paid_search_abs ?? 0,
        paidDisplay: entry.paid_display_abs ?? (entry.paid_abs ?? 0) - (entry.paid_search_abs ?? 0),
        webReferral: entry.browser_abs ?? 0,
        appReferral: entry.app_referral_abs ?? 0,
      }));
    } else {
      console.warn(`[ST] ${platform.toUpperCase()} 유입 경로 API 실패 (${result.status || result.error})`);
    }

    console.log(`[ST] ${platform.toUpperCase()} 유입 경로: ${sources[os].length}일 데이터`);
  }

  return sources;
}

/**
 * 앱 개요 수집 (DOM 스크래핑 — API 없음)
 */
async function collectAppOverview(page) {
  console.log('[ST] 앱 개요 수집...');
  const url = `${ST.baseUrl}/overview/${ST.uai}/${ST.views.ios.appId}?country=KR`;

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(8000);

    mkdirSync(SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({
      path: join(SCREENSHOT_DIR, `st-overview-${new Date().toISOString().slice(0, 10)}.png`),
    });

    const overview = await page.evaluate(() => {
      const data = {};
      const allElements = document.querySelectorAll('*');
      const metricPairs = [];

      for (const el of allElements) {
        const text = el.textContent?.trim();
        if (text && /^[\$]?\d+\.?\d*[KMB]?$/.test(text) && el.children.length === 0) {
          const parent = el.parentElement;
          const parentText = parent?.innerText?.trim() || '';
          metricPairs.push({ value: text, context: parentText.slice(0, 100) });
        }
      }

      for (const pair of metricPairs) {
        if (pair.context.includes('다운로드') && !data.downloads) data.downloads = pair.value;
        else if (pair.context.includes('수익') && pair.value.startsWith('$') && !data.revenue) data.revenue = pair.value;
        else if (pair.context.includes('DAU') && !data.dau) data.dau = pair.value;
        else if (pair.context.includes('RPD') && !data.rpd) data.rpd = pair.value;
      }

      return data;
    });

    console.log('[ST] 앱 개요:', JSON.stringify(overview));
    return overview;
  } catch (e) {
    console.error('[ST] 앱 개요 수집 실패:', e.message);
    return {};
  }
}

/**
 * 세션 저장
 */
async function saveSession(context) {
  mkdirSync(config.paths.authState, { recursive: true });
  const state = await context.storageState();
  writeFileSync(AUTH_STATE_FILE, JSON.stringify(state));
}

/**
 * 전체 Sensor Tower 데이터 수집
 */
export async function collectSensorTowerData() {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const { browser, context, page, csrfToken } = await initBrowser();

  try {
    const data = {
      date: new Date().toISOString().slice(0, 10),
      iosRankings: {},
      androidRankings: {},
      categoryRankings: {},
      downloadSources: { ios: [], android: [] },
      overview: {},
      collectedAt: new Date().toISOString(),
    };

    // 1. iOS 키워드 (API)
    data.iosRankings = await collectKeywordRankings(page, csrfToken, 'ios');

    // 2. Android 키워드 (API)
    data.androidRankings = await collectKeywordRankings(page, csrfToken, 'android');

    // 3. 카테고리 랭킹 (API)
    data.categoryRankings = await collectCategoryRankings(page, csrfToken);

    // 4. OS별 유입 경로 (API)
    data.downloadSources = await collectDownloadSources(page, csrfToken);

    // 5. 앱 개요 (DOM)
    data.overview = await collectAppOverview(page);

    // 6. 세션 갱신 저장
    await saveSession(context);

    // 7. JSON 저장
    const outputDir = join(config.paths.root, 'data');
    mkdirSync(outputDir, { recursive: true });
    const outputPath = join(outputDir, `st-${data.date}.json`);
    writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`[ST] 데이터 저장: ${outputPath}`);

    console.log('[ST] 전체 수집 완료');
    console.log(`  iOS 키워드: ${Object.keys(data.iosRankings).length}개`);
    console.log(`  Android 키워드: ${Object.keys(data.androidRankings).length}개`);
    console.log(`  개요: ${JSON.stringify(data.overview)}`);

    return data;
  } catch (e) {
    console.error('[ST] 수집 중 오류:', e.message);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, `st-fatal-${Date.now()}.png`),
    }).catch(() => {});
    throw e;
  } finally {
    await browser.close();
  }
}
