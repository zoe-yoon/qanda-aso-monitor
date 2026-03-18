/**
 * 키워드 관리 페이지에서 앱 드롭다운으로 Android 전환
 */
import { chromium } from 'playwright';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const AUTH_STATE_FILE = join(process.cwd(), 'auth-state', 'st-session.json');
const SS = join(process.cwd(), 'screenshots');

async function switchAndroid() {
  console.log('=== Android 앱 전환 테스트 ===\n');
  mkdirSync(SS, { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ storageState: AUTH_STATE_FILE });
  const page = await context.newPage();

  try {
    await page.goto('https://app.sensortower.com/store-marketing/aso/keyword-management?' +
      'os=ios&country=KR&device=iphone&ssia=1270676408&page=1&page_size=100', {
      waitUntil: 'domcontentloaded', timeout: 60000,
    });
    await page.waitForTimeout(8000);

    // 1. 앱 선택 드롭다운 클릭 ("QANDA: AI Math & Study H..." 영역)
    console.log('[1] 앱 드롭다운 클릭...');
    const appDropdown = page.locator('[class*="QANDA"], text=QANDA').first();
    // 또는 앱 선택기 영역
    const appSelector = page.locator('[data-test*="app-selector"], [class*="app-selector"], [class*="AppSelector"]');

    // 앱 이름이 있는 드롭다운 버튼 찾기
    const dropdownBtn = page.locator('button:has-text("QANDA"), [role="combobox"]:has-text("QANDA")');

    // 시도 1: 앱 이름 영역의 드롭다운 아이콘
    try {
      // 왼쪽 사이드바의 앱 이름 + 드롭다운 영역
      const appNameArea = page.locator('[class*="Mathpresso"]').first();
      const appArea = appNameArea.locator('..').locator('..');
      await appArea.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: join(SS, 'switch-1-clicked.png') });
    } catch(e) {
      console.log('   시도 1 실패:', e.message.slice(0, 80));
    }

    // 시도 2: 더 넓은 영역 - 앱 아이콘+이름 컨테이너
    try {
      const qandaEl = page.locator('text=QANDA: AI Math').first();
      await qandaEl.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: join(SS, 'switch-2-clicked.png') });

      // 드롭다운 옵션 수집
      const options = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('[role="option"], [role="menuitem"], [class*="MenuItem"], [class*="ListItem"]').forEach(el => {
          items.push({
            text: el.textContent?.trim()?.slice(0, 100),
            dataTest: el.getAttribute('data-test'),
          });
        });
        // 또는 Popover/Dropdown 안의 항목들
        document.querySelectorAll('[class*="Popover"] *, [class*="dropdown"] *, [class*="Menu"] li').forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length < 80 && (
            text.includes('Android') || text.includes('Google Play') ||
            text.includes('iOS') || text.includes('QANDA') ||
            text.includes('com.mathpresso')
          )) {
            items.push({ text, tag: el.tagName, class: el.className?.toString()?.slice(0, 80) });
          }
        });
        return items;
      });
      console.log('   옵션:', JSON.stringify(options, null, 2));
    } catch(e) {
      console.log('   시도 2 실패:', e.message.slice(0, 80));
    }

    // 시도 3: 드롭다운 화살표 아이콘 (select/combobox)
    console.log('\n[2] 앱 선택 영역 상세 분석...');
    const appSelectorInfo = await page.evaluate(() => {
      // 좌측 사이드바에서 앱 관련 요소 찾기
      const results = [];
      document.querySelectorAll('[class*="app"], [class*="App"]').forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.includes('QANDA') && text.length < 200) {
          results.push({
            tag: el.tagName,
            class: el.className?.toString()?.slice(0, 120),
            role: el.getAttribute('role'),
            dataTest: el.getAttribute('data-test'),
            clickable: el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' || el.getAttribute('role') === 'combobox',
            text: text.slice(0, 80),
          });
        }
      });
      return results;
    });
    console.log(JSON.stringify(appSelectorInfo, null, 2));

    // 시도 4: select 요소 또는 MUI Select 컴포넌트
    console.log('\n[3] MUI Select/드롭다운 찾기...');
    const selectInfo = await page.evaluate(() => {
      const selects = [];
      // MUI Select
      document.querySelectorAll('[class*="MuiSelect"], select, [role="combobox"], [role="listbox"]').forEach(el => {
        selects.push({
          tag: el.tagName,
          class: el.className?.toString()?.slice(0, 100),
          text: el.textContent?.trim()?.slice(0, 80),
          role: el.getAttribute('role'),
        });
      });
      return selects;
    });
    console.log(JSON.stringify(selectInfo, null, 2));

    // 시도 5: 좌측 앱 영역에 있는 드롭다운 아이콘(▼) 클릭
    console.log('\n[4] 앱 영역 드롭다운 아이콘 클릭...');
    try {
      // 앱 이름 옆의 화살표/드롭다운 아이콘
      const arrowIcon = page.locator('[class*="QANDA"] svg, [data-test*="SvgIcon"]').first();
      await arrowIcon.click({ timeout: 3000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: join(SS, 'switch-4-arrow.png') });
    } catch(e) {
      // 앱 이름 텍스트 바로 우측의 드롭다운
      try {
        const header = page.locator('.MuiSelect-select, [class*="select"]').first();
        await header.click({ timeout: 3000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: join(SS, 'switch-4b-select.png') });
      } catch(e2) {
        console.log('   드롭다운 아이콘 실패');
      }
    }

    // 최종: URL에서 ssia 변경 후 페이지 전체 새로고침
    console.log('\n[5] URL ssia 직접 변경 테스트...');
    await page.goto('https://app.sensortower.com/store-marketing/aso/keyword-management?' +
      'os=android&country=KR&device=android_mobile&ssia=com.mathpresso.qanda&page=1&page_size=100', {
      waitUntil: 'domcontentloaded', timeout: 60000,
    });
    await page.waitForTimeout(8000);
    console.log('   URL:', page.url());
    await page.screenshot({ path: join(SS, 'switch-5-android-url.png') });

    // 디바이스 드롭다운 확인
    const deviceText = await page.evaluate(() => {
      // 디바이스 선택기 텍스트
      const els = document.querySelectorAll('[class*="select"], [role="combobox"]');
      return Array.from(els).map(e => e.textContent?.trim()?.slice(0, 50));
    });
    console.log('   디바이스 선택:', deviceText);

    const state = await context.storageState();
    writeFileSync(AUTH_STATE_FILE, JSON.stringify(state));
    console.log('\n✅ 완료');
  } catch (e) {
    console.error('❌:', e.message);
  } finally {
    await browser.close();
  }
}

switchAndroid();
