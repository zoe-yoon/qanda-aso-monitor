/**
 * 카테고리 랭킹 API — country=KR 파라미터 추가 + 히스토리 API 탐색
 */
import { chromium } from 'playwright';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUTH_STATE = join(__dirname, '..', 'auth-state', 'st-session.json');

const ST = {
  uai: '564d5f563fc720868c00859b',
  baseUrl: 'https://app.sensortower.com',
  ios: { appId: '1270676408' },
  android: { appId: 'com.mathpresso.qanda' },
};

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: AUTH_STATE });
  const page = await context.newPage();

  let csrfToken = '';
  const capturedAPIs = [];

  page.on('request', (req) => {
    const t = req.headers()['x-csrf-token'];
    if (t) csrfToken = t;
  });

  // 모든 API 응답 캡처
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/') && res.status() === 200) {
      try {
        const body = await res.json();
        capturedAPIs.push({ url, data: body });
      } catch {}
    }
  });

  await page.goto(ST.baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  if (!csrfToken) {
    csrfToken = await page.evaluate(() =>
      document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  // 시도할 엔드포인트 목록
  const tests = [
    // 1. country=KR 파라미터 추가
    {
      name: 'category_rankings?country=KR',
      url: `/api/unified/apps/${ST.uai}/category_rankings?country=KR`,
    },
    // 2. category=6017 (Education) 추가
    {
      name: 'category_rankings?country=KR&category=6017',
      url: `/api/unified/apps/${ST.uai}/category_rankings?country=KR&category=6017`,
    },
    // 3. facets API로 카테고리 랭킹 시도
    {
      name: 'facets: category_rank by date',
      url: `/api/v2/apps/facets?query_identifier=category_ranking_chart_${ST.ios.appId}`,
      method: 'POST',
      body: {
        breakdowns: [['date']],
        facets: [
          { facet: 'top_chart_ranking', alias: 'ranking' },
        ],
        filters: {
          app_ids: [ST.ios.appId],
          start_date: thirtyAgo,
          end_date: today,
          regions: ['KR'],
          devices: ['iphone'],
          os: 'ios',
          categories: ['6017'],
          chart_type: 'free',
        },
      },
    },
    // 4. unified ranking_history
    {
      name: 'unified ranking_history',
      url: `/api/unified/apps/${ST.uai}/ranking_history?country=KR&category=6017&chart_type=free&start_date=${thirtyAgo}&end_date=${today}`,
    },
    // 5. app_intel ranking_history
    {
      name: 'app_intel ranking_history (ios)',
      url: `/api/app_intel/${ST.uai}/${ST.ios.appId}/ranking_history?country=KR&category=6017&chart_type=free&start_date=${thirtyAgo}&end_date=${today}&os=ios`,
    },
    // 6. v2 top_charts facets
    {
      name: 'v2 top_charts facets',
      url: `/api/v2/top_charts/facets?query_identifier=app_ranking_history`,
      method: 'POST',
      body: {
        breakdowns: [['date']],
        facets: [
          { facet: 'ranking', alias: 'ranking' },
        ],
        filters: {
          app_ids: [ST.ios.appId],
          start_date: thirtyAgo,
          end_date: today,
          country: 'KR',
          device: 'iphone',
          os: 'ios',
          category: '6017',
          chart_type: 'free',
        },
      },
    },
    // 7. unified top_chart_rankings
    {
      name: 'unified top_chart_rankings',
      url: `/api/unified/apps/${ST.uai}/top_chart_rankings?country=KR&start_date=${thirtyAgo}&end_date=${today}`,
    },
    // 8. store_intel rankings
    {
      name: 'store_intel rankings',
      url: `/api/store_intel/rankings?os=ios&app_id=${ST.ios.appId}&country=KR&category=6017&chart_type=free&start_date=${thirtyAgo}&end_date=${today}`,
    },
  ];

  for (const test of tests) {
    try {
      const result = await page.evaluate(async ({ url, method, body, csrf }) => {
        const opts = {
          method: method || 'GET',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text.slice(0, 300); }
        return { status: res.status, data };
      }, { url: test.url, method: test.method, body: test.body, csrf: csrfToken });

      console.log(`\n[${test.name}] ${result.status}`);
      if (result.status === 200) {
        const d = result.data;
        if (typeof d === 'object') {
          console.log('  Keys:', Object.keys(d));
          const json = JSON.stringify(d, null, 2);
          console.log('  Data:', json.slice(0, 800));
          if (json.length > 800) console.log('  ... (truncated, total:', json.length, 'chars)');
        } else {
          console.log('  Data:', String(d).slice(0, 500));
        }
      }
    } catch (e) {
      console.log(`[${test.name}] Error: ${e.message}`);
    }
  }

  // 5. 앱 개요 페이지에서 KR country로 캡처
  capturedAPIs.length = 0;
  console.log('\n\n=== 앱 개요 페이지 (country=KR) ===');
  await page.goto(`${ST.baseUrl}/overview/${ST.uai}/${ST.ios.appId}?country=KR`, {
    waitUntil: 'domcontentloaded', timeout: 30000,
  });
  await page.waitForTimeout(10000);

  console.log(`캡처된 API: ${capturedAPIs.length}개`);
  for (const api of capturedAPIs) {
    if (api.url.includes('ranking') || api.url.includes('categor') || api.url.includes('chart') || api.url.includes('top_')) {
      console.log(`\n📡 ${api.url}`);
      console.log('  Data:', JSON.stringify(api.data, null, 2).slice(0, 1000));
    }
  }

  await browser.close();
  console.log('\n✅ 완료');
}

run().catch(console.error);
