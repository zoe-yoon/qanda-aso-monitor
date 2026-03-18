/**
 * /api/unified/apps/{uai}/category_rankings 응답 상세 확인
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
};

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: AUTH_STATE });
  const page = await context.newPage();

  let csrfToken = '';
  page.on('request', (req) => {
    const t = req.headers()['x-csrf-token'];
    if (t) csrfToken = t;
  });

  await page.goto(ST.baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  if (!csrfToken) {
    csrfToken = await page.evaluate(() =>
      document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    );
  }
  console.log(`CSRF: ${csrfToken.slice(0, 20)}...`);

  // 카테고리 랭킹 API 호출
  const result = await page.evaluate(async ({ uai, csrf }) => {
    const res = await fetch(`/api/unified/apps/${uai}/category_rankings`, {
      headers: { 'X-CSRF-Token': csrf },
    });
    return { status: res.status, data: await res.json() };
  }, { uai: ST.uai, csrf: csrfToken });

  console.log(`\nStatus: ${result.status}`);
  console.log('Top-level keys:', Object.keys(result.data));

  // iOS 데이터 구조
  const ios = result.data.ios;
  console.log('\n=== iOS ===');
  console.log('Type:', typeof ios, Array.isArray(ios) ? `array[${ios.length}]` : '');
  if (Array.isArray(ios) && ios.length > 0) {
    console.log('First item keys:', Object.keys(ios[0]));
    console.log('First item:', JSON.stringify(ios[0], null, 2));
    if (ios.length > 1) console.log('Second item:', JSON.stringify(ios[1], null, 2));
    console.log('Total items:', ios.length);
    // 교육 카테고리 찾기
    const edu = ios.filter(i => i.category === '6017' || i.category_name?.includes('Education') || i.category_name?.includes('교육'));
    if (edu.length > 0) {
      console.log('\n교육 카테고리:', JSON.stringify(edu, null, 2));
    }
  } else if (typeof ios === 'object' && !Array.isArray(ios)) {
    console.log('Keys:', Object.keys(ios));
    console.log('Full data:', JSON.stringify(ios, null, 2).slice(0, 2000));
  }

  // Android 데이터 구조
  const android = result.data.android;
  console.log('\n=== Android ===');
  console.log('Type:', typeof android, Array.isArray(android) ? `array[${android.length}]` : '');
  if (Array.isArray(android) && android.length > 0) {
    console.log('First item keys:', Object.keys(android[0]));
    console.log('First item:', JSON.stringify(android[0], null, 2));
    console.log('Total items:', android.length);
  } else if (typeof android === 'object' && !Array.isArray(android)) {
    console.log('Keys:', Object.keys(android));
    console.log('Full data:', JSON.stringify(android, null, 2).slice(0, 2000));
  }

  // 전체 출력 (작으면)
  const fullJson = JSON.stringify(result.data, null, 2);
  if (fullJson.length < 5000) {
    console.log('\n=== Full Response ===');
    console.log(fullJson);
  } else {
    console.log(`\nFull response size: ${fullJson.length} chars`);
  }

  await browser.close();
}

run().catch(console.error);
