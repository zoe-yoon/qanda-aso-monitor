/**
 * category_rankings?country=KR&date=YYYY-MM-DD 로 과거 30일 히스토리 수집 테스트
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
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
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

  // 30일 데이터 수집
  const results = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);

    const result = await page.evaluate(async ({ uai, csrf, date }) => {
      const res = await fetch(`/api/unified/apps/${uai}/category_rankings?country=KR&date=${date}`, {
        headers: { 'X-CSRF-Token': csrf },
      });
      if (res.status !== 200) return { status: res.status, data: null };
      return { status: 200, data: await res.json() };
    }, { uai: ST.uai, csrf: csrfToken, date });

    if (result.status === 200 && result.data) {
      const d = result.data;
      const iosIphone = d.ios?.iphone?.top_free?.primary_categories?.find(c => c['6017'] != null)?.['6017'] ?? null;
      const iosIpad = d.ios?.ipad?.top_free?.primary_categories?.find(c => c['6017'] != null)?.['6017'] ?? null;
      const android = d.android?.android?.top_free?.primary_categories?.find(c => c['education'] != null)?.['education'] ?? null;

      results.push({ date, iosIphone, iosIpad, android });
      console.log(`${date}: iOS iPhone=${iosIphone}, iPad=${iosIpad}, Android=${android}`);
    } else {
      console.log(`${date}: ${result.status} (no data)`);
      results.push({ date, iosIphone: null, iosIpad: null, android: null });
    }
  }

  console.log(`\n✅ 수집 완료: ${results.filter(r => r.iosIphone !== null).length}일 데이터`);
  console.log(JSON.stringify(results, null, 2));

  await browser.close();
}

run().catch(console.error);
