/**
 * Android API 호출 수정 — 한국 viewId + 디바이스명 시도
 */
import { chromium } from 'playwright';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const AUTH_STATE_FILE = join(process.cwd(), 'auth-state', 'st-session.json');

function makeBody(os, device, viewId) {
  return {
    breakdowns: [[], ["keyword"]],
    facets: [
      { facet: "keyword", alias: "keyword" },
      { facet: "keyword_rank", alias: "keyword_rank" },
      { facet: "keyword_rank", measure: "delta", alias: "keyword_rank_growth" },
      { facet: "keyword_traffic", alias: "keyword_traffic" },
      { facet: "keyword_difficulty_score", alias: "keyword_difficulty_score" },
      { facet: "keyword_opportunity_score", alias: "keyword_opportunity_score" },
      { facet: "est_keyword_downloads", alias: "est_keyword_downloads" },
      { facet: "est_keyword_downloads_share", alias: "est_keyword_downloads_share" },
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
  console.log('=== Android API 수정 테스트 ===\n');

  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({ storageState: AUTH_STATE_FILE });
  const page = await context.newPage();

  try {
    let csrfToken = '';
    page.on('request', (req) => {
      const t = req.headers()['x-csrf-token'];
      if (t) csrfToken = t;
    });

    await page.goto('https://app.sensortower.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    if (!csrfToken) {
      csrfToken = await page.evaluate(() =>
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
      );
    }

    const callApi = async (label, appId, viewId, os, device) => {
      console.log(`\n[${label}] viewId=${viewId}, device=${device}`);
      const body = makeBody(os, device, viewId);
      const result = await page.evaluate(async ({ body, csrf, appId }) => {
        const res = await fetch(`/api/v2/apps/facets?query_identifier=aso_keywords_management_table_${appId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        return { status: res.status, count: data.data?.length || 0, first: data.data?.[0], error: data.error || data.message };
      }, { body, csrf: csrfToken, appId });

      console.log(`   Status: ${result.status} | 키워드: ${result.count}개`);
      if (result.first) console.log(`   첫째: ${result.first.keyword} — 순위 ${result.first.keyword_rank}`);
      if (result.error) console.log(`   에러: ${JSON.stringify(result.error).slice(0, 200)}`);
      return result;
    };

    // iOS (확인용)
    await callApi('iOS', '1270676408', '6980555e58005572eb4d657d', 'ios', 'iphone');

    // Android 한국 viewId + 다양한 디바이스명
    await callApi('Android-KR-mobile', 'com.mathpresso.qanda', '69a0059e04429989a8cf2159', 'android', 'android_mobile');
    await callApi('Android-KR-phone', 'com.mathpresso.qanda', '69a0059e04429989a8cf2159', 'android', 'android_phone');
    await callApi('Android-KR-all', 'com.mathpresso.qanda', '69a0059e04429989a8cf2159', 'android', 'phone');

    // 인도네시아 viewId로도 시도
    await callApi('Android-ID', 'com.mathpresso.qanda', '698445d12d94188f03a79a7c', 'android', 'android_mobile');

    // metadata 확인 — Android 한국 뷰에 키워드가 등록되어 있는지
    console.log('\n[metadata] Android 한국 뷰 키워드 확인...');
    const meta = await page.evaluate(async (csrf) => {
      const res = await fetch('/api/app_intel/user_apps/69a0059e04429989a8cf2159/metadata?country=KR', {
        headers: { 'X-CSRF-Token': csrf },
      });
      return res.json();
    }, csrfToken);
    console.log(`   키워드 수: ${meta.keyword_counts_for_all_countries?.KR || 0}`);
    console.log(`   키워드: ${meta.keywords?.slice(0, 10).join(', ')}`);

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
