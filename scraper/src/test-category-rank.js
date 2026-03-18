/**
 * Sensor Tower 카테고리 랭킹 API 탐색
 *
 * 교육 카테고리 내 콴다 앱의 순위 추이 데이터를 찾기 위한 테스트
 */
import { chromium } from 'playwright';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUTH_STATE = join(__dirname, '..', 'auth-state', 'st-session.json');

const ST = {
  uai: '564d5f563fc720868c00859b',
  baseUrl: 'https://app.sensortower.com',
  ios: { appId: '1270676408' },
  android: { appId: 'com.mathpresso.qanda' },
};

async function run() {
  if (!existsSync(AUTH_STATE)) {
    console.error('세션 파일 없음. npm run test-login 먼저 실행');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: AUTH_STATE });
  const page = await context.newPage();

  // CSRF 토큰 캡처
  let csrfToken = '';
  const capturedRequests = [];

  page.on('request', (req) => {
    const t = req.headers()['x-csrf-token'];
    if (t) csrfToken = t;

    const url = req.url();
    // 카테고리, 랭킹, 차트 관련 API 요청 캡처
    if (url.includes('/api/') && (
      url.includes('categor') || url.includes('rank') || url.includes('chart') ||
      url.includes('top_') || url.includes('timeline') || url.includes('history') ||
      url.includes('trend')
    )) {
      capturedRequests.push({
        url,
        method: req.method(),
        postData: req.postData()?.slice(0, 500),
      });
    }
  });

  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/') && (
      url.includes('categor') || url.includes('rank') || url.includes('chart') ||
      url.includes('top_') || url.includes('timeline') || url.includes('history') ||
      url.includes('trend')
    )) {
      try {
        const body = await res.json();
        console.log(`\n📡 Response: ${res.status()} ${url}`);
        console.log('  Data keys:', Object.keys(body));
        if (body.data) console.log('  data length:', Array.isArray(body.data) ? body.data.length : typeof body.data);
        if (body.data?.[0]) console.log('  first item:', JSON.stringify(body.data[0]).slice(0, 300));
      } catch {}
    }
  });

  // 1. 메인 페이지 — CSRF 획득
  console.log('1. 메인 페이지 접근...');
  await page.goto(ST.baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  if (!csrfToken) {
    csrfToken = await page.evaluate(() =>
      document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    );
  }
  console.log(`   CSRF: ${csrfToken ? csrfToken.slice(0, 20) + '...' : 'NONE'}`);

  // 2. iOS 앱 개요 페이지 방문 (카테고리 랭킹 차트가 있을 수 있음)
  console.log('\n2. iOS 앱 개요 페이지...');
  const overviewUrl = `${ST.baseUrl}/overview/${ST.uai}/${ST.ios.appId}?country=KR`;
  await page.goto(overviewUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(8000);

  console.log(`\n   캡처된 API 요청 (overview): ${capturedRequests.length}개`);
  capturedRequests.forEach((r, i) => {
    console.log(`   [${i}] ${r.method} ${r.url}`);
    if (r.postData) console.log(`       body: ${r.postData}`);
  });

  // 3. 카테고리 랭킹 관련 API 직접 시도
  console.log('\n3. 카테고리 랭킹 API 직접 호출 시도...');

  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  // 시도 1: top_charts 계열
  const endpoints = [
    {
      name: 'top_charts ranking_history',
      url: `/api/v2/ios/top_charts/ranking_history?app_id=${ST.ios.appId}&country=KR&category=6017&chart_type=free&start_date=${thirtyDaysAgo}&end_date=${today}`,
      method: 'GET',
    },
    {
      name: 'category_rankings',
      url: `/api/v2/apps/facets?query_identifier=category_rankings_${ST.ios.appId}`,
      method: 'POST',
      body: {
        breakdowns: [['date']],
        facets: [
          { facet: 'category_rank', alias: 'category_rank' },
        ],
        filters: {
          app_ids: [ST.ios.appId],
          start_date: thirtyDaysAgo,
          end_date: today,
          regions: ['KR'],
          devices: ['iphone'],
          os: 'ios',
          category: '6017', // Education
        },
      },
    },
    {
      name: 'app_intel category_history (ios)',
      url: `/api/app_intel/${ST.uai}/${ST.ios.appId}/category_history?country=KR&category=6017&start_date=${thirtyDaysAgo}&end_date=${today}`,
      method: 'GET',
    },
    {
      name: 'ranking chart (ios)',
      url: `/api/v2/ios/ranking/chart?app_id=${ST.ios.appId}&country=KR&category=6017&chart_type=free&start_date=${thirtyDaysAgo}&end_date=${today}`,
      method: 'GET',
    },
    {
      name: 'store_intel category_timeline',
      url: `/api/store_intel/category_timeline?os=ios&app_id=${ST.ios.appId}&country=KR&category=6017&start_date=${thirtyDaysAgo}&end_date=${today}`,
      method: 'GET',
    },
  ];

  for (const ep of endpoints) {
    try {
      const result = await page.evaluate(async ({ url, method, body, csrf }) => {
        const opts = {
          method,
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(url, opts);
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text.slice(0, 500); }
        return { status: res.status, data };
      }, { url: ep.url, method: ep.method, body: ep.body, csrf: csrfToken });

      console.log(`\n   [${ep.name}] ${result.status}`);
      if (result.status === 200) {
        const d = result.data;
        console.log('   Keys:', typeof d === 'object' ? Object.keys(d) : 'string');
        if (d.data) {
          console.log('   data length:', Array.isArray(d.data) ? d.data.length : typeof d.data);
          if (Array.isArray(d.data) && d.data[0]) console.log('   first:', JSON.stringify(d.data[0]).slice(0, 300));
        } else {
          console.log('   response:', JSON.stringify(d).slice(0, 500));
        }
      }
    } catch (e) {
      console.log(`   [${ep.name}] Error: ${e.message}`);
    }
  }

  // 4. 네트워크 캡처 초기화 후 Top Charts 페이지 방문
  capturedRequests.length = 0;
  console.log('\n4. Top Charts 페이지 방문...');
  const topChartsUrl = `${ST.baseUrl}/top-charts/ios/overall/education-free/kr/?date=${today}`;
  await page.goto(topChartsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(8000);

  console.log(`   캡처된 API 요청 (top-charts): ${capturedRequests.length}개`);
  capturedRequests.forEach((r, i) => {
    console.log(`   [${i}] ${r.method} ${r.url}`);
    if (r.postData) console.log(`       body: ${r.postData}`);
  });

  await browser.close();
  console.log('\n✅ 탐색 완료');
}

run().catch(console.error);
