/**
 * Sensor Tower에서 QANDA Android 앱 ID 찾기
 */
import { chromium } from 'playwright';
import { join } from 'path';
import { existsSync, writeFileSync, mkdirSync } from 'fs';

const AUTH_STATE_FILE = join(process.cwd(), 'auth-state', 'st-session.json');
const SS = join(process.cwd(), 'screenshots');

async function findAndroidId() {
  console.log('=== QANDA Android 앱 ID 찾기 ===\n');
  mkdirSync(SS, { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: AUTH_STATE_FILE });
  const page = await context.newPage();

  try {
    // 앱 개요에서 "3개의 앱" 링크 확인 — iOS(2), Android(1)
    await page.goto('https://app.sensortower.com/overview/564d5f563fc720868c00859b/1270676408?country=KR', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(5000);

    // "3개의 앱" 근처 링크/ID 수집
    const appIds = await page.evaluate(() => {
      const results = [];
      // 모든 링크에서 overview 패턴 찾기
      document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (href.includes('/overview/') || href.includes('app_id=')) {
          results.push({ href, text: a.textContent?.trim()?.slice(0, 80) });
        }
      });

      // Android 아이콘 (🤖 또는 Android 관련) 근처 요소
      const allText = document.body.innerText;
      const lines = allText.split('\n').filter(l =>
        l.includes('Android') || l.includes('android') ||
        l.includes('Google Play') || l.includes('Play Store')
      );

      return { links: results, androidLines: lines.slice(0, 10) };
    });

    console.log('[1] 앱 링크:', JSON.stringify(appIds.links, null, 2));
    console.log('[1] Android 관련:', appIds.androidLines);

    // "3개의 앱" 또는 앱 선택 드롭다운 클릭
    console.log('\n[2] 앱 선택 드롭다운 확인...');
    const appSelector = page.locator('text=3개의 앱, [class*="app-selector"], [class*="app-switch"]');
    try {
      await appSelector.first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: join(SS, 'find-android-dropdown.png') });

      const dropdownItems = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('[role="option"], [role="menuitem"], [class*="dropdown"] li, [class*="menu"] a').forEach(el => {
          items.push({
            text: el.textContent?.trim()?.slice(0, 100),
            href: el.getAttribute('href') || '',
          });
        });
        return items;
      });
      console.log('   드롭다운:', JSON.stringify(dropdownItems, null, 2));
    } catch (e) {
      console.log('   드롭다운 실패:', e.message);
    }

    // 직접 검색으로 Android 앱 찾기
    console.log('\n[3] QANDA Android 검색...');
    await page.goto('https://app.sensortower.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const searchInput = page.locator('input[placeholder*="검색"], input[placeholder*="Search"]');
    await searchInput.first().click();
    await searchInput.first().fill('QANDA mathpresso');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: join(SS, 'find-android-search.png') });

    // 검색 결과에서 Android 앱 링크 수집
    const searchResults = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('a[href*="overview"]').forEach(a => {
        results.push({
          href: a.getAttribute('href'),
          text: a.textContent?.trim()?.slice(0, 100),
        });
      });
      return results;
    });
    console.log('   검색 결과:', JSON.stringify(searchResults, null, 2));

    // Android 아이콘이 있는 앱 클릭
    // Sensor Tower에서 iOS는 🍎, Android는 🤖 아이콘
    const androidIcon = await page.evaluate(() => {
      // 검색 결과에서 Android 마크가 있는 항목
      const items = [];
      document.querySelectorAll('[class*="search-result"], [class*="app-item"]').forEach(el => {
        const text = el.textContent || '';
        const html = el.innerHTML || '';
        if (html.includes('android') || html.includes('Android') || html.includes('play_store') || html.includes('google-play')) {
          items.push({ text: text.slice(0, 100), html: html.slice(0, 300) });
        }
      });
      return items;
    });
    console.log('   Android 아이콘 항목:', JSON.stringify(androidIcon, null, 2));

    // 세션 갱신
    const state = await context.storageState();
    writeFileSync(AUTH_STATE_FILE, JSON.stringify(state));
    console.log('\n✅ 완료');

  } catch (e) {
    console.error('❌ 실패:', e.message);
  } finally {
    await browser.close();
  }
}

findAndroidId();
