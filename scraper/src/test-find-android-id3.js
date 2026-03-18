/**
 * Android SSIA 찾기 - SubappSelector 컴포넌트 활용
 */
import { chromium } from 'playwright';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const AUTH_STATE_FILE = join(process.cwd(), 'auth-state', 'st-session.json');
const SS = join(process.cwd(), 'screenshots');

async function find() {
  console.log('=== Android SSIA 찾기 (3차) ===\n');
  mkdirSync(SS, { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: AUTH_STATE_FILE });
  const page = await context.newPage();

  try {
    // 1. 네트워크 요청 감시 - API에서 앱 ID 포착
    const apiCalls = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('api') && (url.includes('app') || url.includes('564d5f'))) {
        try {
          const body = await response.text();
          if (body.includes('android') || body.includes('com.mathpresso')) {
            apiCalls.push({ url: url.slice(0, 200), snippet: body.slice(0, 500) });
          }
        } catch {}
      }
    });

    await page.goto('https://app.sensortower.com/overview/564d5f563fc720868c00859b/1270676408?country=KR', {
      waitUntil: 'domcontentloaded', timeout: 30000,
    });
    await page.waitForTimeout(6000);

    // 2. SubappSelector 찾기
    console.log('[1] SubappSelector 찾기...');
    const subappSelector = await page.evaluate(() => {
      const el = document.querySelector('[class*="SubappSelector"]');
      if (!el) return { found: false };
      return {
        found: true,
        class: el.className?.toString()?.slice(0, 150),
        text: el.textContent?.trim()?.slice(0, 200),
        html: el.innerHTML?.slice(0, 1000),
      };
    });
    console.log(JSON.stringify(subappSelector, null, 2));

    // 3. 스크롤해서 서브앱 선택 영역 찾기
    console.log('\n[2] 서브앱 목록 스크롤 탐색...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const subapps = await page.evaluate(() => {
      const results = [];
      // 모든 앱 카드/항목 찾기
      document.querySelectorAll('[class*="subapp"], [class*="SubApp"], [class*="AppCard"], [data-test*="app"]').forEach(el => {
        results.push({
          class: el.className?.toString()?.slice(0, 100),
          text: el.textContent?.trim()?.slice(0, 150),
          dataTest: el.getAttribute('data-test'),
        });
      });
      return results;
    });
    console.log('서브앱 요소:', JSON.stringify(subapps.slice(0, 10), null, 2));

    // 4. "3개의 앱" 카드 영역 전체 클릭 → 서브앱 모달/드롭다운 열기
    console.log('\n[3] "3개의 앱" 카드 클릭...');
    const appCountCard = page.locator('[class*="AppOverviewUnifiedHeader"]');
    try {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1000);
      await appCountCard.first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: join(SS, 'find3-subapp-opened.png') });

      // 열린 모달/드롭다운에서 앱 목록 수집
      const modalApps = await page.evaluate(() => {
        const results = [];
        // 모달/팝오버 안의 앱 항목들
        document.querySelectorAll('[class*="Popover"] a, [class*="Modal"] a, [class*="Drawer"] a, [role="dialog"] a, [class*="subapp"] a').forEach(a => {
          results.push({
            href: a.getAttribute('href'),
            text: a.textContent?.trim()?.slice(0, 100),
          });
        });
        // 또는 라디오/체크박스 목록
        document.querySelectorAll('[class*="Popover"] *, [class*="subapp"] *, [role="dialog"] *').forEach(el => {
          const text = el.textContent?.trim();
          if (text && (text.includes('Android') || text.includes('Google Play') || text.includes('com.mathpresso'))) {
            results.push({
              tag: el.tagName,
              text: text.slice(0, 100),
              class: el.className?.toString()?.slice(0, 80),
            });
          }
        });
        return results;
      });
      console.log('모달 앱 목록:', JSON.stringify(modalApps, null, 2));
    } catch (e) {
      console.log('카드 클릭 실패:', e.message.slice(0, 100));
    }

    // 5. API 호출에서 Android ID 포착
    console.log('\n[4] API 호출에서 Android 정보:');
    console.log(JSON.stringify(apiCalls.slice(0, 5), null, 2));

    // 6. 직접 페이지 소스에서 Android 관련 ID 검색
    console.log('\n[5] 페이지 소스에서 Android ID 검색...');
    const sourceIds = await page.evaluate(() => {
      const html = document.documentElement.innerHTML;
      const results = [];

      // com.mathpresso 관련
      const pkgMatches = html.match(/com\.mathpresso[^"'\s]*/g);
      if (pkgMatches) results.push({ type: 'package', values: [...new Set(pkgMatches)] });

      // ssia 파라미터들
      const ssiaMatches = html.match(/ssia[=:]["']?(\d+)/g);
      if (ssiaMatches) results.push({ type: 'ssia', values: [...new Set(ssiaMatches)] });

      // 앱 ID 패턴 (10자리 숫자)
      const appIdMatches = html.match(/["'](\d{8,12})["']/g);
      if (appIdMatches) {
        const unique = [...new Set(appIdMatches)].slice(0, 20);
        results.push({ type: 'numericIds', values: unique });
      }

      // android 관련 URL
      const androidUrls = html.match(/android[^"'\s]{0,100}/gi);
      if (androidUrls) results.push({ type: 'androidUrls', values: [...new Set(androidUrls)].slice(0, 10) });

      return results;
    });
    console.log(JSON.stringify(sourceIds, null, 2));

    const state = await context.storageState();
    writeFileSync(AUTH_STATE_FILE, JSON.stringify(state));
    console.log('\n✅ 완료');
  } catch (e) {
    console.error('❌:', e.message);
  } finally {
    await browser.close();
  }
}

find();
