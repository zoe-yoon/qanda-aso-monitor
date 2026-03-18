/**
 * Sensor Tower 내부 API 직접 호출 테스트
 *
 * 브라우저 세션 쿠키 + CSRF 토큰으로 API 직접 호출
 * DOM 스크래핑 없이 데이터 수집
 */
import { chromium } from 'playwright';
import { join } from 'path';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';

const AUTH_STATE_FILE = join(process.cwd(), 'auth-state', 'st-session.json');
const SS = join(process.cwd(), 'screenshots');

async function testApiDirect() {
  console.log('=== API 직접 호출 테스트 ===\n');
  mkdirSync(SS, { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({ storageState: AUTH_STATE_FILE });
  const page = await context.newPage();

  try {
    // 1. CSRF 토큰 얻기 (페이지 한 번 방문 필요)
    console.log('[1] CSRF 토큰 획득...');
    let csrfToken = '';

    page.on('request', (request) => {
      const token = request.headers()['x-csrf-token'];
      if (token) csrfToken = token;
    });

    await page.goto('https://app.sensortower.com', {
      waitUntil: 'domcontentloaded', timeout: 30000,
    });
    await page.waitForTimeout(5000);

    // 페이지 메타 태그에서도 CSRF 토큰 확인
    if (!csrfToken) {
      csrfToken = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta?.getAttribute('content') || '';
      });
    }

    console.log(`   CSRF: ${csrfToken ? csrfToken.slice(0, 20) + '...' : '없음'}`);

    // 2. 요청 body 캡처 (iOS 페이지 한 번 로딩해서 POST body 확인)
    console.log('\n[2] POST body 캡처...');
    let postBody = null;

    page.on('request', (request) => {
      if (request.url().includes('facets') && request.method() === 'POST') {
        postBody = request.postData();
      }
    });

    await page.goto('https://app.sensortower.com/store-marketing/aso/keyword-management?' +
      'os=ios&country=KR&device=iphone&ssia=1270676408&page=1&page_size=100', {
      waitUntil: 'domcontentloaded', timeout: 60000,
    });
    await page.waitForTimeout(8000);

    console.log('   POST body:', postBody?.slice(0, 500));
    writeFileSync(join(SS, 'api-post-body.json'), postBody || '{}');

    // 3. iOS API 직접 호출
    console.log('\n[3] iOS API 직접 호출...');
    const iosResponse = await page.evaluate(async (body) => {
      const res = await fetch('/api/v2/apps/facets?query_identifier=aso_keywords_management_table_1270676408', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      return { status: res.status, data: await res.json() };
    }, postBody);

    console.log(`   Status: ${iosResponse.status}`);
    console.log(`   키워드 수: ${iosResponse.data?.data?.length || 0}`);
    if (iosResponse.data?.data?.[0]) {
      console.log('   첫 키워드:', JSON.stringify(iosResponse.data.data[0]));
    }

    // 4. Android API 호출 (앱ID만 변경)
    console.log('\n[4] Android API 호출...');

    // POST body에서 앱ID 변경
    let androidBody = postBody;
    if (androidBody) {
      const parsed = JSON.parse(androidBody);
      // app_id 또는 ssia 관련 필드 변경
      console.log('   원본 body 키:', Object.keys(parsed));

      // body 내용 확인해서 적절히 변경
      androidBody = androidBody.replace(/1270676408/g, 'com.mathpresso.qanda');
      androidBody = androidBody.replace(/"os":"ios"/g, '"os":"android"');
      androidBody = androidBody.replace(/"device":"iphone"/g, '"device":"android_mobile"');
    }

    const androidResponse = await page.evaluate(async (body) => {
      const res = await fetch('/api/v2/apps/facets?query_identifier=aso_keywords_management_table_com.mathpresso.qanda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      return { status: res.status, data: await res.json() };
    }, androidBody);

    console.log(`   Status: ${androidResponse.status}`);
    console.log(`   키워드 수: ${androidResponse.data?.data?.length || 0}`);
    if (androidResponse.data?.data?.[0]) {
      console.log('   첫 키워드:', JSON.stringify(androidResponse.data.data[0]));
    }

    // iOS와 Android 비교
    if (iosResponse.data?.data && androidResponse.data?.data) {
      const iosFirst = iosResponse.data.data[0];
      const androidFirst = androidResponse.data.data[0];
      const same = iosFirst?.keyword_rank === androidFirst?.keyword_rank &&
                   iosFirst?.keyword === androidFirst?.keyword;
      console.log(`\n   iOS vs Android 동일 여부: ${same ? '⚠️ 동일' : '✅ 다름!'}`);
    }

    // 결과 저장
    writeFileSync(join(SS, 'api-ios-result.json'), JSON.stringify(iosResponse.data, null, 2));
    writeFileSync(join(SS, 'api-android-result.json'), JSON.stringify(androidResponse.data, null, 2));

    const state = await context.storageState();
    writeFileSync(AUTH_STATE_FILE, JSON.stringify(state));
    console.log('\n✅ 완료');
  } catch (e) {
    console.error('❌:', e.message);
  } finally {
    await browser.close();
  }
}

testApiDirect();
