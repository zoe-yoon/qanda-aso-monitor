/**
 * QANDA Android SSIA 찾기 (2차)
 *
 * 앱 개요 → "3개의 앱" 영역 → Android 아이콘 클릭 → URL에서 ssia 추출
 */
import { chromium } from 'playwright';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const AUTH_STATE_FILE = join(process.cwd(), 'auth-state', 'st-session.json');
const SS = join(process.cwd(), 'screenshots');

async function find() {
  console.log('=== Android SSIA 찾기 ===\n');
  mkdirSync(SS, { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: AUTH_STATE_FILE });
  const page = await context.newPage();

  try {
    await page.goto('https://app.sensortower.com/overview/564d5f563fc720868c00859b/1270676408?country=KR', {
      waitUntil: 'domcontentloaded', timeout: 30000,
    });
    await page.waitForTimeout(6000);

    // 1. "3개의 앱" 배지 근처 구조 분석
    console.log('[1] "3개의 앱" 배지 구조...');
    const badgeInfo = await page.evaluate(() => {
      const results = [];
      // "3개의 앱" 텍스트 근처 요소
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent?.includes('3개의 앱') || node.textContent?.includes('3 apps')) {
          const el = node.parentElement;
          const parent = el?.parentElement;
          results.push({
            text: el?.textContent?.trim(),
            tag: el?.tagName,
            class: el?.className?.toString()?.slice(0, 100),
            parentTag: parent?.tagName,
            parentClass: parent?.className?.toString()?.slice(0, 100),
            parentHTML: parent?.innerHTML?.slice(0, 500),
            // 형제/자식 중 클릭 가능한 요소
            clickables: parent ? Array.from(parent.querySelectorAll('a, button, [role="button"]')).map(c => ({
              tag: c.tagName,
              href: c.getAttribute('href'),
              text: c.textContent?.trim()?.slice(0, 50),
            })) : [],
          });
        }
      }
      return results;
    });
    console.log(JSON.stringify(badgeInfo, null, 2));

    // 2. Apple/Android 아이콘 찾기 (SVG 또는 이미지)
    console.log('\n[2] OS 아이콘 찾기...');
    const iconInfo = await page.evaluate(() => {
      const results = [];
      // (2) (1) 같은 숫자가 있는 요소 찾기
      document.querySelectorAll('*').forEach(el => {
        const text = el.textContent?.trim();
        // 정확히 "(2)" 또는 "(1)" 텍스트를 가진 작은 요소
        if (text && (text === '(2)' || text === '(1)') && el.children.length === 0) {
          const parent = el.parentElement;
          results.push({
            text,
            tag: el.tagName,
            class: el.className?.toString()?.slice(0, 80),
            parentText: parent?.textContent?.trim()?.slice(0, 50),
            parentClass: parent?.className?.toString()?.slice(0, 100),
            parentTag: parent?.tagName,
            grandParentHTML: parent?.parentElement?.innerHTML?.slice(0, 300),
          });
        }
      });
      return results;
    });
    console.log(JSON.stringify(iconInfo, null, 2));

    // 3. 스크롤 다운해서 개별 앱 카드 찾기
    console.log('\n[3] 스크롤해서 개별 앱 카드 찾기...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);
    }
    await page.screenshot({ path: join(SS, 'find-android-scroll.png'), fullPage: true });

    // 개별 앱 섹션 (iOS/Android 별도 카드가 있을 수 있음)
    const appSections = await page.evaluate(() => {
      const results = [];
      // "Play Store" 또는 "Google Play" 또는 Android 관련 텍스트
      document.querySelectorAll('a[href*="overview"]').forEach(a => {
        const href = a.getAttribute('href');
        // overview URL에서 ssia 추출
        const match = href?.match(/\/overview\/[^/]+\/(\d+)/);
        if (match) {
          results.push({
            ssia: match[1],
            href,
            text: a.textContent?.trim()?.slice(0, 100),
          });
        }
      });
      return results;
    });
    console.log('   overview 링크:', JSON.stringify(appSections, null, 2));

    // 4. Android 아이콘 (🤖 SVG) 클릭 시도
    console.log('\n[4] Android 아이콘 영역 클릭 시도...');
    // "3개의 앱" 배지에서 Android 숫자(1) 클릭
    const androidBadge = page.locator('text=(1)').first();
    try {
      await androidBadge.click({ timeout: 3000 });
      await page.waitForTimeout(3000);
      console.log('   클릭 후 URL:', page.url());
      await page.screenshot({ path: join(SS, 'find-android-clicked.png') });
    } catch (e) {
      console.log('   (1) 클릭 실패:', e.message.slice(0, 100));
    }

    // 5. 키워드 관리 페이지에서 직접 os=android + device 변경 시도
    console.log('\n[5] 키워드 관리에서 디바이스 드롭다운 시도...');
    await page.goto('https://app.sensortower.com/store-marketing/aso/keyword-management?' +
      'os=ios&country=KR&device=iphone&ssia=1270676408&page=1&page_size=100', {
      waitUntil: 'domcontentloaded', timeout: 30000,
    });
    await page.waitForTimeout(6000);

    // "iPhone" 드롭다운 클릭 → "Android" 선택
    const deviceDropdown = page.locator('text=iPhone');
    try {
      await deviceDropdown.first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: join(SS, 'find-android-device-dropdown.png') });

      // 드롭다운 옵션 수집
      const options = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('[role="option"], [role="menuitem"], li, [class*="option"]').forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length < 50) items.push(text);
        });
        return items;
      });
      console.log('   디바이스 옵션:', options);

      // Android 옵션 클릭
      const androidOpt = page.locator('text=Android, text=android, text=Google Play');
      if (await androidOpt.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await androidOpt.first().click();
        await page.waitForTimeout(5000);
        console.log('   Android 전환 후 URL:', page.url());
        await page.screenshot({ path: join(SS, 'find-android-switched.png') });
      }
    } catch (e) {
      console.log('   디바이스 드롭다운 실패:', e.message.slice(0, 100));
    }

    // 세션 갱신
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
