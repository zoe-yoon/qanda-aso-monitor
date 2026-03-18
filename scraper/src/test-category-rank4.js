/**
 * Sensor Tower 앱 개요 페이지에서 카테고리 랭킹 히스토리 차트 API 캡처
 *
 * 전략: 모든 /api/ 요청을 캡처하면서 앱 개요 페이지를 탐색
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
};

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: AUTH_STATE });
  const page = await context.newPage();

  let csrfToken = '';
  const allAPIs = [];

  page.on('request', (req) => {
    const t = req.headers()['x-csrf-token'];
    if (t) csrfToken = t;

    const url = req.url();
    if (url.includes('/api/')) {
      allAPIs.push({
        url: url.replace(ST.baseUrl, ''),
        method: req.method(),
        postData: req.postData()?.slice(0, 1000),
      });
    }
  });

  const apiResponses = [];
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/') && res.status() === 200) {
      try {
        const body = await res.json();
        apiResponses.push({ url: url.replace(ST.baseUrl, ''), body });
      } catch {}
    }
  });

  // 1. 메인 페이지
  await page.goto(ST.baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  if (!csrfToken) {
    csrfToken = await page.evaluate(() =>
      document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    );
  }

  // 2. 앱 개요 페이지 (KR)
  allAPIs.length = 0;
  apiResponses.length = 0;
  console.log('앱 개요 페이지 방문 (KR)...');
  await page.goto(`${ST.baseUrl}/overview/${ST.uai}/${ST.ios.appId}?country=KR`, {
    waitUntil: 'domcontentloaded', timeout: 30000,
  });
  await page.waitForTimeout(12000);

  console.log(`\n=== 모든 API 요청 (${allAPIs.length}개) ===`);
  allAPIs.forEach((a, i) => {
    console.log(`[${i}] ${a.method} ${a.url}`);
    if (a.postData) console.log(`    body: ${a.postData}`);
  });

  console.log(`\n=== 모든 API 응답 (${apiResponses.length}개) ===`);
  apiResponses.forEach((a, i) => {
    const json = JSON.stringify(a.body);
    console.log(`\n[${i}] ${a.url}`);
    console.log(`    size: ${json.length} chars`);
    if (typeof a.body === 'object') {
      console.log(`    keys: ${Object.keys(a.body)}`);
      // data 배열이 있으면 첫번째 항목 표시
      if (Array.isArray(a.body.data) && a.body.data.length > 0) {
        console.log(`    data[0]: ${JSON.stringify(a.body.data[0]).slice(0, 300)}`);
        console.log(`    data length: ${a.body.data.length}`);
      }
      if (a.body.data && !Array.isArray(a.body.data)) {
        console.log(`    data type: ${typeof a.body.data}`);
        console.log(`    data keys: ${Object.keys(a.body.data)}`);
      }
    }
    // 작은 응답은 전체 표시
    if (json.length < 2000) {
      console.log(`    full: ${json}`);
    }
  });

  // 3. facets API로 직접 top_chart_ranking 히스토리 시도
  console.log('\n\n=== facets API 직접 호출 ===');
  const today = new Date().toISOString().slice(0, 10);
  const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const facetsTests = [
    {
      name: 'top_chart_ranking by date (ios)',
      body: {
        breakdowns: [['date']],
        facets: [
          { facet: 'top_chart_ranking', alias: 'ranking' },
        ],
        filters: {
          app_ids: ['1270676408'],
          start_date: thirtyAgo,
          end_date: today,
          regions: ['KR'],
          devices: ['iphone'],
          os: 'ios',
          categories: ['6017'],
          chart_type: 'free',
        },
        order_by: [{ date: 'asc' }],
      },
    },
    {
      name: 'top_chart_ranking by date (android)',
      body: {
        breakdowns: [['date']],
        facets: [
          { facet: 'top_chart_ranking', alias: 'ranking' },
        ],
        filters: {
          app_ids: ['com.mathpresso.qanda'],
          start_date: thirtyAgo,
          end_date: today,
          regions: ['KR'],
          devices: ['android'],
          os: 'android',
          categories: ['EDUCATION'],
          chart_type: 'free',
        },
        order_by: [{ date: 'asc' }],
      },
    },
    {
      name: 'store_ranking by date',
      body: {
        breakdowns: [['date']],
        facets: [
          { facet: 'store_ranking', alias: 'ranking' },
        ],
        filters: {
          app_ids: ['1270676408'],
          start_date: thirtyAgo,
          end_date: today,
          regions: ['KR'],
          devices: ['iphone'],
          os: 'ios',
        },
        order_by: [{ date: 'asc' }],
      },
    },
    {
      name: 'category_ranking by date',
      body: {
        breakdowns: [['date']],
        facets: [
          { facet: 'category_ranking', alias: 'ranking' },
        ],
        filters: {
          app_ids: ['1270676408'],
          start_date: thirtyAgo,
          end_date: today,
          regions: ['KR'],
          devices: ['iphone'],
          os: 'ios',
          categories: ['6017'],
        },
        order_by: [{ date: 'asc' }],
      },
    },
  ];

  for (const test of facetsTests) {
    const result = await page.evaluate(async ({ body, csrf }) => {
      const res = await fetch('/api/v2/apps/facets?query_identifier=category_rank_history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text.slice(0, 500); }
      return { status: res.status, data };
    }, { body: test.body, csrf: csrfToken });

    console.log(`\n[${test.name}] ${result.status}`);
    if (result.status === 200) {
      const d = result.data;
      if (d.data) {
        console.log(`  data length: ${Array.isArray(d.data) ? d.data.length : typeof d.data}`);
        if (Array.isArray(d.data) && d.data[0]) console.log(`  first: ${JSON.stringify(d.data[0])}`);
        if (Array.isArray(d.data) && d.data.length > 1) console.log(`  last: ${JSON.stringify(d.data[d.data.length - 1])}`);
      } else {
        console.log(`  response: ${JSON.stringify(d).slice(0, 500)}`);
      }
    } else {
      console.log(`  error: ${JSON.stringify(result.data).slice(0, 300)}`);
    }
  }

  await browser.close();
  console.log('\n✅ 완료');
}

run().catch(console.error);
