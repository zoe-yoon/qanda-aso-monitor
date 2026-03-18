/**
 * Android 키워드 페이지 실제 네트워크 요청 캡처
 * — 웹 UI가 보내는 정확한 POST body를 잡아서 비교
 */
import { chromium } from 'playwright';
import { join } from 'path';
import { writeFileSync } from 'fs';

const AUTH = join(process.cwd(), 'auth-state', 'st-session.json');

async function capture() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({ storageState: AUTH });
  const page = await context.newPage();

  const captured = [];

  // 모든 API 요청 캡처
  page.on('request', req => {
    if (req.url().includes('/api/') && (req.method() === 'POST' || req.method() === 'GET')) {
      const entry = {
        url: req.url(),
        method: req.method(),
        headers: Object.fromEntries(
          Object.entries(req.headers()).filter(([k]) => ['x-csrf-token', 'content-type', 'x-requested-with'].includes(k))
        ),
      };
      if (req.method() === 'POST') {
        entry.body = req.postData();
      }
      captured.push(entry);
    }
  });

  page.on('response', async res => {
    if (res.url().includes('facets')) {
      try {
        const data = await res.json();
        console.log(`\n[응답] ${res.url().split('?')[1]}`);
        console.log(`  Status: ${res.status()}`);
        console.log(`  데이터: ${data.data?.length || 0}개`);
        if (data.error) console.log(`  에러:`, JSON.stringify(data.error).slice(0, 300));
        if (data.message) console.log(`  메시지:`, data.message);
      } catch {}
    }
  });

  // Android 한국 키워드 관리 페이지 접속
  console.log('[1] Android 한국 키워드 관리 페이지 접속...');
  await page.goto(
    'https://app.sensortower.com/store-marketing/aso/keyword-management?' +
    'os=android&country=KR&device=android_mobile&ssia=com.mathpresso.qanda&page=1&page_size=100',
    { waitUntil: 'domcontentloaded', timeout: 60000 }
  );
  await page.waitForTimeout(12000);

  // 캡처된 요청 중 facets 관련만 출력
  console.log(`\n[2] 캡처된 API 요청: ${captured.length}개`);
  const facetRequests = captured.filter(c => c.url.includes('facets'));
  console.log(`  facets 요청: ${facetRequests.length}개`);

  for (const req of facetRequests) {
    console.log(`\n--- ${req.method} ${req.url} ---`);
    if (req.body) {
      writeFileSync(
        join(process.cwd(), 'screenshots', 'android-api-body.json'),
        req.body
      );
      console.log('Body 저장: screenshots/android-api-body.json');
      // iOS body와 비교할 수 있도록 주요 필드 출력
      try {
        const parsed = JSON.parse(req.body);
        console.log('  keyword_view_id:', parsed.filters?.keyword_view_id);
        console.log('  os:', parsed.filters?.os);
        console.log('  devices:', parsed.filters?.devices);
        console.log('  regions:', parsed.filters?.regions);
        console.log('  facets 수:', parsed.facets?.length);
        console.log('  inner limit:', parsed.filters?.keywords?.in?.limit);
      } catch {}
    }
  }

  // 캡처 안 된 경우 — 페이지 URL 리다이렉트 확인
  console.log(`\n[3] 현재 URL: ${page.url()}`);

  // 전체 캡처 로그 저장
  writeFileSync(
    join(process.cwd(), 'screenshots', 'android-all-requests.json'),
    JSON.stringify(captured, null, 2)
  );
  console.log('[4] 전체 요청 로그: screenshots/android-all-requests.json');

  const state = await context.storageState();
  writeFileSync(AUTH, JSON.stringify(state));
  console.log('\n✅ 완료');
  await browser.close();
}

capture();
