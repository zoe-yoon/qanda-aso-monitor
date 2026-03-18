/**
 * 과거 30일 키워드 순위를 Sensor Tower에서 가져와 Google Sheets에 적재
 *
 * 사용: node src/backfill-sheets.js
 */
import { chromium } from 'playwright';
import { config } from './config.js';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeRankings, writeDownloads, writeCategoryRank, writeSuggestions } from './sheets-writer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');

const AUTH_STATE_FILE = join(config.paths.authState, 'st-session.json');

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

function makeKeywordBodyForDate(view, targetDate) {
  const end = new Date(targetDate);
  const start = new Date(end - 90 * 86400000);
  const compEnd = new Date(end - 1 * 86400000);
  const compStart = new Date(compEnd - 7 * 86400000);
  const weekAgo = new Date(end - 7 * 86400000);

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
      start_date: start.toISOString().slice(0, 10),
      end_date: targetDate,
      comparison_start_date: compStart.toISOString().slice(0, 10),
      comparison_end_date: compEnd.toISOString().slice(0, 10),
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
            start_date: weekAgo.toISOString().slice(0, 10),
            end_date: targetDate,
            comparison_start_date: compStart.toISOString().slice(0, 10),
            comparison_end_date: compEnd.toISOString().slice(0, 10),
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

async function fetchKeywordsForDate(page, csrfToken, platform, targetDate) {
  const view = ST.views[platform];
  const body = makeKeywordBodyForDate(view, targetDate);

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
    console.error(`  [${platform}] API 에러: ${result.error}`);
    return {};
  }

  const rankings = {};
  for (const row of result.rows) {
    rankings[row.keyword] = {
      rank: row.keyword_rank ?? null,
      change: row.keyword_rank_growth ?? 0,
      trafficScore: row.keyword_traffic ?? null,
      searchVolume: row.est_keyword_downloads ?? null,
    };
  }
  return rankings;
}

async function main() {
  if (!existsSync(AUTH_STATE_FILE)) {
    console.error('세션 파일이 없습니다. npm run test-login 먼저 실행하세요.');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: AUTH_STATE_FILE });
  const page = await context.newPage();

  // CSRF 토큰 캡처
  let csrfToken = '';
  page.on('request', (req) => {
    const t = req.headers()['x-csrf-token'];
    if (t) csrfToken = t;
  });

  await page.goto(ST.baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  if (page.url().includes('sign_in')) {
    await browser.close();
    console.error('세션 만료! npm run test-login 실행하세요.');
    process.exit(1);
  }

  if (!csrfToken) {
    csrfToken = await page.evaluate(() =>
      document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    );
  }

  console.log(`CSRF 토큰 획득: ${csrfToken.slice(0, 20)}...`);
  console.log('=== 과거 30일 키워드 데이터 백필 시작 ===\n');

  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    console.log(`📅 ${date} (${30 - i}/30)`);

    try {
      const iosRankings = await fetchKeywordsForDate(page, csrfToken, 'ios', date);
      const androidRankings = await fetchKeywordsForDate(page, csrfToken, 'android', date);

      const iosCount = Object.keys(iosRankings).length;
      const androidCount = Object.keys(androidRankings).length;

      if (iosCount === 0 && androidCount === 0) {
        console.log(`  ⏭ 데이터 없음, 스킵`);
        continue;
      }

      console.log(`  iOS: ${iosCount}개, Android: ${androidCount}개`);

      // JSON 파일 저장 (주간 리포트용)
      mkdirSync(DATA_DIR, { recursive: true });
      const jsonPath = join(DATA_DIR, `st-${date}.json`);
      if (!existsSync(jsonPath)) {
        const jsonData = { date, iosRankings, androidRankings, categoryRankings: [], collectedAt: new Date().toISOString() };
        writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
        console.log(`  💾 JSON 저장: st-${date}.json`);
      }

      await writeRankings('iOS_Rankings', date, iosRankings);
      await writeRankings('Android_Rankings', date, androidRankings);
      await writeDownloads('iOS_Downloads', date, iosRankings);
      await writeDownloads('Android_Downloads', date, androidRankings);

      console.log(`  ✅ Sheets 적재 완료`);

      // API 과부하 방지
      await page.waitForTimeout(2000);
    } catch (e) {
      console.error(`  ❌ ${date} 실패: ${e.message}`);
    }
  }

  // 카테고리 랭킹도 30일 백필
  console.log('\n📊 카테고리 랭킹 30일 백필...');
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);

    try {
      const result = await page.evaluate(async ({ uai, csrf, date }) => {
        const res = await fetch(`/api/unified/apps/${uai}/category_rankings?country=KR&date=${date}`, {
          headers: { 'X-CSRF-Token': csrf },
        });
        if (res.status !== 200) return null;
        return res.json();
      }, { uai: ST.uai, csrf: csrfToken, date });

      if (result) {
        const catEntry = {
          date,
          iosIphone: result.ios?.iphone?.top_free?.primary_categories?.find(c => c['6017'] != null)?.['6017'] ?? null,
          iosIpad: result.ios?.ipad?.top_free?.primary_categories?.find(c => c['6017'] != null)?.['6017'] ?? null,
          android: result.android?.android?.top_free?.primary_categories?.find(c => c['education'] != null)?.['education'] ?? null,
        };
        await writeCategoryRank(date, [catEntry]);

        // JSON에 카테고리 랭킹 추가
        const jsonPath = join(DATA_DIR, `st-${date}.json`);
        if (existsSync(jsonPath)) {
          const existing = JSON.parse(readFileSync(jsonPath, 'utf-8'));
          existing.categoryRankings = [catEntry];
          writeFileSync(jsonPath, JSON.stringify(existing, null, 2));
        }
      }
    } catch (e) {
      console.error(`  ❌ CategoryRank ${date}: ${e.message}`);
    }
  }

  await browser.close();
  console.log('\n✅ 백필 완료!');
}

main().catch((e) => {
  console.error('치명적 오류:', e);
  process.exit(1);
});
