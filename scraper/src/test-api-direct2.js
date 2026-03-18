/**
 * Sensor Tower API 직접 호출 (CSRF 토큰 포함)
 */
import { chromium } from 'playwright';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const AUTH_STATE_FILE = join(process.cwd(), 'auth-state', 'st-session.json');
const SS = join(process.cwd(), 'screenshots');

// iOS POST body 템플릿
function makePostBody(os, device, viewId) {
  return {
    breakdowns: [[], ["keyword"]],
    facets: [
      { facet: "keyword", alias: "keyword" },
      { facet: "keyword_added_status", alias: "keyword_added_status" },
      { facet: "keyword_rank", alias: "keyword_rank" },
      { facet: "keyword_rank", measure: "delta", alias: "keyword_rank_growth" },
      { facet: "keyword_rank", measure: "comparison", alias: "keyword_rank_previous" },
      { facet: "keyword_traffic", alias: "keyword_traffic" },
      { facet: "keyword_difficulty_score", alias: "keyword_difficulty_score" },
      { facet: "keyword_opportunity_score", alias: "keyword_opportunity_score" },
      { facet: "est_keyword_downloads", alias: "est_keyword_downloads" },
      { facet: "est_keyword_downloads_share", alias: "est_keyword_downloads_share" },
      { facet: "est_keyword_downloads", measure: "growth", alias: "est_keyword_downloads_pop_growth_percentage" },
      { facet: "est_keyword_downloads", measure: "comparison", alias: "est_keyword_downloads_previous" },
      { facet: "keyword_app_count", alias: "keyword_app_count" },
      { facet: "keyword_type", alias: "keyword_type" },
      { facet: "keyword_density", alias: "keyword_density" },
      { facet: "keyword_occurrences", alias: "keyword_occurrences" },
      { facet: "description_length", alias: "description_length" },
      { facet: "keyword_paid_search_state", alias: "keyword_paid_search_state" },
    ],
    filters: {
      keyword_view_id: viewId,
      start_date: "2025-12-19",
      end_date: "2026-03-18",
      comparison_start_date: "2025-09-20",
      comparison_end_date: "2025-12-18",
      regions: ["KR"],
      devices: [device],
      os,
      keywords: {
        in: {
          breakdowns: [["keyword"]],
          facets: [
            { facet: "keyword", alias: "keyword" },
            { facet: "keyword_traffic", alias: "keyword_traffic" },
            { facet: "keyword_rank", alias: "keyword_rank" },
          ],
          filters: {
            keyword_view_id: viewId,
            start_date: "2026-03-11",
            end_date: "2026-03-18",
            comparison_start_date: "2025-09-20",
            comparison_end_date: "2025-12-18",
            regions: ["KR"],
            devices: [device],
            os,
          },
          limit: 100,
          offset: 0,
          order_by: [{ keyword_rank: "asc" }, { keyword_traffic: "desc" }],
        },
      },
    },
    order_by: [{ keyword_rank: "asc" }, { keyword_traffic: "desc" }],
  };
}

async function test() {
  console.log('=== API 직접 호출 (CSRF 포함) ===\n');
  mkdirSync(SS, { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({ storageState: AUTH_STATE_FILE });
  const page = await context.newPage();

  try {
    // 1. CSRF 토큰 + 쿠키 획득
    console.log('[1] CSRF 토큰 획득...');
    let csrfToken = '';
    page.on('request', (req) => {
      const t = req.headers()['x-csrf-token'];
      if (t) csrfToken = t;
    });

    // 간단한 API 호출 하나 트리거
    await page.goto('https://app.sensortower.com', {
      waitUntil: 'domcontentloaded', timeout: 30000,
    });
    await page.waitForTimeout(5000);

    if (!csrfToken) {
      csrfToken = await page.evaluate(() =>
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
      );
    }
    console.log(`   CSRF: ${csrfToken.slice(0, 30)}...`);

    // 2. iOS 키워드 API 호출
    console.log('\n[2] iOS 키워드 API 호출...');
    const iosBody = makePostBody('ios', 'iphone', '6980555e58005572eb4d657d');

    const iosResult = await page.evaluate(async ({ body, csrf }) => {
      const res = await fetch('/api/v2/apps/facets?query_identifier=aso_keywords_management_table_1270676408', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return { status: res.status, count: data.data?.length || 0, first: data.data?.[0], error: data.error };
    }, { body: iosBody, csrf: csrfToken });

    console.log(`   Status: ${iosResult.status}`);
    console.log(`   키워드 수: ${iosResult.count}`);
    if (iosResult.first) {
      console.log(`   첫 키워드: ${iosResult.first.keyword} — 순위 ${iosResult.first.keyword_rank}`);
    }
    if (iosResult.error) console.log(`   에러:`, iosResult.error);

    // 3. Android용 keyword_view_id 찾기
    console.log('\n[3] 등록된 앱 목록 확인...');
    const userApps = await page.evaluate(async (csrf) => {
      const res = await fetch('/api/app_intel/user_apps', {
        headers: { 'X-CSRF-Token': csrf },
      });
      return res.json();
    }, csrfToken);

    const apps = userApps.user_apps || [];
    console.log(`   등록 앱: ${apps.length}개`);
    apps.forEach(app => {
      console.log(`   - ${app.appName || app.name} | OS: ${app.os} | ID: ${app.appId} | viewId: ${app.id}`);
    });

    // Android 앱의 viewId 찾기
    const androidApp = apps.find(a => a.os === 'android');
    const androidViewId = androidApp?.id;

    if (androidViewId) {
      console.log(`\n[4] Android 키워드 API 호출 (viewId: ${androidViewId})...`);
      const androidBody = makePostBody('android', 'android_mobile', androidViewId);

      const androidResult = await page.evaluate(async ({ body, csrf, appId }) => {
        const res = await fetch(`/api/v2/apps/facets?query_identifier=aso_keywords_management_table_${appId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrf,
          },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        return { status: res.status, count: data.data?.length || 0, first: data.data?.[0], error: data.error };
      }, { body: androidBody, csrf: csrfToken, appId: androidApp.appId });

      console.log(`   Status: ${androidResult.status}`);
      console.log(`   키워드 수: ${androidResult.count}`);
      if (androidResult.first) {
        console.log(`   첫 키워드: ${androidResult.first.keyword} — 순위 ${androidResult.first.keyword_rank}`);
      }
      if (androidResult.error) console.log(`   에러:`, androidResult.error);

      // 비교
      if (iosResult.first && androidResult.first) {
        const same = iosResult.first.keyword_rank === androidResult.first.keyword_rank;
        console.log(`\n   iOS "${iosResult.first.keyword}": 순위 ${iosResult.first.keyword_rank}`);
        console.log(`   Android "${androidResult.first.keyword}": 순위 ${androidResult.first.keyword_rank}`);
        console.log(`   → ${same ? '⚠️ 동일' : '✅ 다른 데이터!'}`);
      }
    } else {
      console.log('\n[4] Android 앱이 등록되어 있지 않음');
    }

    const state = await context.storageState();
    writeFileSync(AUTH_STATE_FILE, JSON.stringify(state));
    console.log('\n✅ 완료');
  } catch (e) {
    console.error('❌:', e.message);
  } finally {
    await browser.close();
  }
}

test();
