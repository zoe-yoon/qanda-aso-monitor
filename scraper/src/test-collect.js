/**
 * 저장된 세션으로 Sensor Tower 데이터 수집 테스트
 *
 * 1. 세션 로드 → 로그인 상태 확인
 * 2. 콴다 iOS 키워드 랭킹 페이지 접속
 * 3. 페이지 구조 캡처 (스크린샷 + HTML)
 */
import { chromium } from 'playwright';
import { config } from './config.js';
import { join } from 'path';
import { existsSync, writeFileSync, mkdirSync } from 'fs';

const AUTH_STATE_FILE = join(config.paths.authState, 'st-session.json');
const SS = config.paths.screenshots;

async function testCollect() {
  console.log('=== Sensor Tower 데이터 수집 테스트 ===\n');

  if (!existsSync(AUTH_STATE_FILE)) {
    console.error('❌ 세션 파일이 없습니다. 먼저 npm run test-login을 실행하세요.');
    process.exit(1);
  }

  mkdirSync(SS, { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: AUTH_STATE_FILE });
  const page = await context.newPage();

  try {
    // 1. 메인 페이지로 접속해서 로그인 상태 확인
    console.log('[1] 메인 페이지 접속...');
    await page.goto('https://app.sensortower.com', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`    URL: ${currentUrl}`);

    if (currentUrl.includes('sign_in') || currentUrl.includes('login')) {
      console.error('❌ 세션이 만료되었습니다. test-login을 다시 실행하세요.');
      await page.screenshot({ path: join(SS, 'test-session-expired.png') });
      await browser.close();
      process.exit(1);
    }

    console.log('✅ 로그인 상태 확인됨\n');
    await page.screenshot({ path: join(SS, 'test-1-main.png'), fullPage: true });

    // 2. 콴다 iOS 키워드 랭킹 페이지
    const iosAppId = config.qanda.iosAppId; // 1150247800
    const kwUrl = `https://app.sensortower.com/ios/keyword-rankings/${iosAppId}?country=KR`;
    console.log(`[2] iOS 키워드 랭킹 페이지: ${kwUrl}`);

    await page.goto(kwUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(5000);

    console.log(`    URL: ${page.url()}`);
    await page.screenshot({ path: join(SS, 'test-2-ios-keywords.png'), fullPage: true });

    // 페이지 HTML 구조 캡처 (테이블 영역)
    const tableHtml = await page.evaluate(() => {
      // 테이블 찾기
      const tables = document.querySelectorAll('table');
      if (tables.length > 0) {
        return Array.from(tables).map((t, i) => ({
          index: i,
          rows: t.querySelectorAll('tr').length,
          outerHTML: t.outerHTML.slice(0, 3000),
        }));
      }

      // 테이블이 없으면 main content 영역
      const main = document.querySelector('main, [class*="content"], [class*="main"]');
      return { noTable: true, mainHtml: main?.innerHTML?.slice(0, 5000) || 'main not found' };
    });

    writeFileSync(
      join(SS, 'test-2-page-structure.json'),
      JSON.stringify(tableHtml, null, 2)
    );
    console.log('    페이지 구조 저장됨: test-2-page-structure.json');

    // 3. Android 키워드 랭킹 페이지
    const androidPkg = config.qanda.androidPackage;
    const androidUrl = `https://app.sensortower.com/android/keyword-rankings/${androidPkg}?country=KR`;
    console.log(`\n[3] Android 키워드 랭킹 페이지: ${androidUrl}`);

    await page.goto(androidUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(5000);

    console.log(`    URL: ${page.url()}`);
    await page.screenshot({ path: join(SS, 'test-3-android-keywords.png'), fullPage: true });

    // 4. iOS 앱 개요 (카테고리 순위)
    const overviewUrl = `https://app.sensortower.com/ios/overview/${iosAppId}?country=KR`;
    console.log(`\n[4] iOS 앱 개요 페이지: ${overviewUrl}`);

    await page.goto(overviewUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(5000);

    console.log(`    URL: ${page.url()}`);
    await page.screenshot({ path: join(SS, 'test-4-ios-overview.png'), fullPage: true });

    // 카테고리 순위 관련 요소 캡처
    const overviewData = await page.evaluate(() => {
      const allText = document.body.innerText;
      // Education/교육 관련 텍스트 찾기
      const lines = allText.split('\n').filter(l =>
        l.includes('Education') || l.includes('교육') ||
        l.includes('Category') || l.includes('카테고리') ||
        l.includes('Rank') || l.includes('순위') ||
        l.match(/#\d+/)
      );
      return lines.slice(0, 30);
    });

    writeFileSync(
      join(SS, 'test-4-overview-data.json'),
      JSON.stringify(overviewData, null, 2)
    );
    console.log('    개요 데이터 저장됨: test-4-overview-data.json');

    // 5. 세션 갱신 저장
    const state = await context.storageState();
    writeFileSync(AUTH_STATE_FILE, JSON.stringify(state));
    console.log('\n✅ 세션 갱신 저장 완료');

    console.log('\n=== 테스트 완료 ===');
    console.log('스크린샷 확인: screenshots/test-*.png');
    console.log('페이지 구조 확인: screenshots/test-*-structure.json');

  } catch (e) {
    console.error('❌ 테스트 실패:', e.message);
    await page.screenshot({ path: join(SS, 'test-error.png') });
  } finally {
    await browser.close();
  }
}

testCollect();
