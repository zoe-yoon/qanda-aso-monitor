/**
 * TreeView에서 Android 서브앱 전환
 */
import { chromium } from 'playwright';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const AUTH_STATE_FILE = join(process.cwd(), 'auth-state', 'st-session.json');
const SS = join(process.cwd(), 'screenshots');

async function test() {
  console.log('=== TreeView Android 전환 ===\n');
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

    // 1. TreeView 구조 분석
    console.log('[1] TreeView 구조...');
    const treeItems = await page.evaluate(() => {
      const tree = document.querySelector('[role="tree"]');
      if (!tree) return { noTree: true };

      const items = [];
      tree.querySelectorAll('[role="treeitem"]').forEach(item => {
        items.push({
          text: item.textContent?.trim()?.slice(0, 100),
          ariaExpanded: item.getAttribute('aria-expanded'),
          ariaSelected: item.getAttribute('aria-selected'),
          class: item.className?.toString()?.slice(0, 100),
        });
      });
      return items;
    });
    console.log(JSON.stringify(treeItems, null, 2));

    // 2. 통합 앱(parent) 노드 클릭 → 서브앱 목록 펼치기
    console.log('\n[2] 통합 앱 노드 펼치기...');
    const parentNode = page.locator('[role="treeitem"]:has-text("QANDA: AI Math Solver")');
    try {
      await parentNode.first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: join(SS, 'tree-1-expanded.png') });

      // 펼쳐진 서브앱 목록
      const expandedItems = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('[role="treeitem"]').forEach(item => {
          items.push({
            text: item.textContent?.trim()?.slice(0, 80),
            expanded: item.getAttribute('aria-expanded'),
            selected: item.getAttribute('aria-selected'),
            level: item.getAttribute('aria-level'),
          });
        });
        return items;
      });
      console.log(JSON.stringify(expandedItems, null, 2));
    } catch(e) {
      console.log('   실패:', e.message.slice(0, 80));
    }

    // 3. "콴다" 서브앱 클릭 (Android일 가능성)
    console.log('\n[3] 서브앱 클릭 시도...');

    // 사이드바의 서브앱 이름들 찾기
    const subAppNames = await page.evaluate(() => {
      const names = [];
      document.querySelectorAll('[class*="selectorSubAppName"], [class*="SubApp"]').forEach(el => {
        names.push(el.textContent?.trim());
      });
      // 또는 "내 보기" 링크 옆의 앱 이름들
      document.querySelectorAll('[class*="AsoEntitySelector"] [class*="appName"], [class*="AsoEntitySelector"] span').forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length > 2 && text.length < 60 && !names.includes(text)) {
          names.push(text);
        }
      });
      return names;
    });
    console.log('   서브앱 이름들:', subAppNames);

    // "콴다" 클릭
    const qandaSubApp = page.locator('[class*="selectorSubAppName"]:has-text("콴다")');
    try {
      await qandaSubApp.first().click();
      await page.waitForTimeout(5000);
      console.log('   "콴다" 클릭 후 URL:', page.url());
      await page.screenshot({ path: join(SS, 'tree-2-qanda-clicked.png') });

      // 디바이스가 Android로 바뀌었는지 확인
      const deviceCheck = await page.evaluate(() => {
        const selects = document.querySelectorAll('[role="combobox"]');
        return Array.from(selects).map(s => s.textContent?.trim()).filter(t => t);
      });
      console.log('   디바이스:', deviceCheck);
    } catch(e) {
      console.log('   "콴다" 클릭 실패:', e.message.slice(0, 80));
    }

    // 4. 다른 서브앱들도 시도
    const subAppSelectors = [
      'QANDA: AI Math & Study Helper',
      'QANDA: AI Math Solver & Study',
    ];
    for (const name of subAppSelectors) {
      console.log(`\n[4] "${name}" 클릭...`);
      const item = page.locator(`[class*="selectorSubAppName"]:has-text("${name.slice(0, 20)}")`);
      try {
        await item.first().click();
        await page.waitForTimeout(3000);
        const url = page.url();
        const ssiaMatch = url.match(/ssia=([^&]+)/);
        console.log(`   ssia: ${ssiaMatch?.[1] || 'N/A'}`);

        // OS 확인
        const osCheck = await page.evaluate(() => {
          const text = document.body.innerText;
          if (text.includes('Google Play') || text.includes('Android')) return 'Android';
          if (text.includes('App Store') || text.includes('iPhone') || text.includes('iPad')) return 'iOS';
          return 'unknown';
        });
        console.log(`   OS: ${osCheck}`);
      } catch(e) {
        console.log(`   실패: ${e.message.slice(0, 60)}`);
      }
    }

    const state = await context.storageState();
    writeFileSync(AUTH_STATE_FILE, JSON.stringify(state));
    console.log('\n✅ 완료');
  } catch (e) {
    console.error('❌:', e.message);
  } finally {
    await browser.close();
  }
}

test();
