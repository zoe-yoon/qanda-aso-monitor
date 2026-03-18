/**
 * Sensor Tower 키워드 관리 페이지의 내부 API 엔드포인트 캡처
 *
 * 페이지 로딩 시 발생하는 API 호출을 가로채서
 * 엔드포인트 URL, 헤더, 응답 구조를 기록
 */
import { chromium } from 'playwright';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const AUTH_STATE_FILE = join(process.cwd(), 'auth-state', 'st-session.json');
const SS = join(process.cwd(), 'screenshots');

async function captureApi() {
  console.log('=== API 엔드포인트 캡처 ===\n');
  mkdirSync(SS, { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({ storageState: AUTH_STATE_FILE });
  const page = await context.newPage();

  const apiCalls = [];

  // 모든 API 호출 가로채기
  page.on('response', async (response) => {
    const url = response.url();
    if (!url.includes('app.sensortower.com/api')) return;

    try {
      const body = await response.text();
      apiCalls.push({
        url,
        status: response.status(),
        method: response.request().method(),
        headers: Object.fromEntries(
          Object.entries(response.request().headers()).filter(([k]) =>
            ['authorization', 'cookie', 'x-csrf-token', 'content-type', 'accept'].includes(k.toLowerCase())
          )
        ),
        bodyPreview: body.slice(0, 1000),
        bodyLength: body.length,
      });
    } catch {}
  });

  try {
    // iOS 키워드 관리 페이지 로딩
    console.log('[1] iOS 키워드 관리 페이지 로딩...');
    await page.goto('https://app.sensortower.com/store-marketing/aso/keyword-management?' +
      'os=ios&country=KR&device=iphone&ssia=1270676408&page=1&page_size=100', {
      waitUntil: 'domcontentloaded', timeout: 60000,
    });
    await page.waitForTimeout(10000);

    console.log(`\n총 ${apiCalls.length}개 API 호출 캡처\n`);

    // 키워드 관련 API 필터
    const kwApis = apiCalls.filter(c =>
      c.url.includes('keyword') || c.url.includes('aso') ||
      c.url.includes('rank') || c.bodyPreview.includes('콴다') ||
      c.bodyPreview.includes('rank')
    );

    console.log(`키워드 관련 API: ${kwApis.length}개\n`);
    kwApis.forEach((api, i) => {
      console.log(`--- API #${i + 1} ---`);
      console.log(`URL: ${api.url}`);
      console.log(`Method: ${api.method}`);
      console.log(`Status: ${api.status}`);
      console.log(`Body length: ${api.bodyLength}`);
      console.log(`Preview: ${api.bodyPreview.slice(0, 300)}`);
      console.log('');
    });

    // 전체 API 호출 목록 (URL만)
    console.log('=== 전체 API 호출 URL 목록 ===');
    apiCalls.forEach((api, i) => {
      console.log(`${i + 1}. [${api.method}] ${api.url.slice(0, 150)} (${api.bodyLength}b)`);
    });

    // 결과 저장
    writeFileSync(join(SS, 'api-captures.json'), JSON.stringify(apiCalls, null, 2));
    console.log(`\n상세 데이터 저장: screenshots/api-captures.json`);

    const state = await context.storageState();
    writeFileSync(AUTH_STATE_FILE, JSON.stringify(state));
    console.log('\n✅ 완료');
  } catch (e) {
    console.error('❌:', e.message);
  } finally {
    await browser.close();
  }
}

captureApi();
