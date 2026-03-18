/**
 * Sensor Tower 콴다 앱 페이지 탐색 (2차)
 *
 * 내부 ID: 564d5f563fc720868c00859b
 * 검색 → 앱 클릭 → 페이지 로딩 대기 → 사이드바/서브메뉴 탐색
 */
import { chromium } from 'playwright';
import { config } from './config.js';
import { join } from 'path';
import { existsSync, writeFileSync, mkdirSync } from 'fs';

const AUTH_STATE_FILE = join(config.paths.authState, 'st-session.json');
const SS = config.paths.screenshots;
const UAI = '564d5f563fc720868c00859b'; // QANDA 내부 ID

async function testNavigate2() {
  console.log('=== Sensor Tower 콴다 앱 페이지 탐색 ===\n');
  mkdirSync(SS, { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: AUTH_STATE_FILE });
  const page = await context.newPage();

  try {
    // 1. 검색으로 콴다 앱 진입
    console.log('[1] 검색으로 QANDA 앱 진입...');
    await page.goto('https://app.sensortower.com', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(3000);

    // 검색
    const searchInput = page.locator('input[placeholder*="검색"], input[placeholder*="Search"], input[type="search"]');
    await searchInput.first().click();
    await page.waitForTimeout(500);
    await searchInput.first().fill('QANDA');
    await page.waitForTimeout(2000);

    // "QANDA: AI Math Solver & Study" 클릭
    const qandaResult = page.locator('text=QANDA: AI Math Solver');
    await qandaResult.first().click();

    // 페이지 로딩 완전히 대기 (스피너 사라질 때까지)
    console.log('   페이지 로딩 대기...');
    await page.waitForTimeout(8000);

    const appUrl = page.url();
    console.log('   앱 페이지 URL:', appUrl);
    await page.screenshot({ path: join(SS, 'nav2-1-app-loaded.png'), fullPage: true });

    // 페이지 내 모든 링크 수집
    const allLinks = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        const text = a.textContent?.trim();
        if (href && text && text.length < 100) {
          links.push({ href, text });
        }
      });
      return links;
    });
    writeFileSync(join(SS, 'nav2-1-all-links.json'), JSON.stringify(allLinks, null, 2));
    console.log(`   총 ${allLinks.length}개 링크`);

    // 키워드/ASO 관련 링크 필터
    const kwLinks = allLinks.filter(l =>
      l.href.includes('keyword') || l.href.includes('aso') ||
      l.href.includes('organic') || l.href.includes('search') ||
      l.text.includes('키워드') || l.text.includes('Keyword') ||
      l.text.includes('ASO') || l.text.includes('검색')
    );
    console.log('   키워드 관련 링크:', JSON.stringify(kwLinks, null, 2));

    // 2. 사이드바/탭 구조 탐색
    console.log('\n[2] 사이드바/탭 구조...');
    const sidebarLinks = await page.evaluate(() => {
      const links = [];
      // 사이드바, 탭, 서브네비 영역
      document.querySelectorAll('[class*="sidebar"] a, [class*="tab"] a, [class*="subnav"] a, [role="tab"], [role="tablist"] button, [class*="menu-item"] a').forEach(el => {
        const href = el.getAttribute('href') || '';
        const text = el.textContent?.trim();
        if (text) links.push({ href, text });
      });
      return links;
    });
    console.log('   사이드바/탭:', JSON.stringify(sidebarLinks, null, 2));

    // 3. "스토어 마케팅" 메뉴 탐색 (ASO 도구가 여기에 있을 수 있음)
    console.log('\n[3] "스토어 마케팅" 메뉴 탐색...');
    const storeMenu = page.locator('text=스토어 마케팅, text=Store Marketing, text=ASO');
    try {
      await storeMenu.first().click();
      await page.waitForTimeout(3000);
      console.log('   URL:', page.url());
      await page.screenshot({ path: join(SS, 'nav2-3-store-marketing.png'), fullPage: true });

      const storeLinks = await page.evaluate(() => {
        const links = [];
        document.querySelectorAll('a[href]').forEach(a => {
          const href = a.getAttribute('href');
          const text = a.textContent?.trim();
          if (href && text && text.length < 100 && (
            href.includes('keyword') || href.includes('aso') ||
            href.includes('ranking') || href.includes('organic') ||
            text.includes('키워드') || text.includes('Keyword') ||
            text.includes('순위') || text.includes('ASO')
          )) {
            links.push({ href, text });
          }
        });
        return links;
      });
      console.log('   ASO 관련:', JSON.stringify(storeLinks, null, 2));
    } catch (e) {
      console.log('   스토어 마케팅 메뉴 접근 실패:', e.message);
    }

    // 4. 직접 URL 패턴 시도 (내부 ID 사용)
    console.log('\n[4] 내부 ID로 URL 패턴 시도...');
    const urlTests = [
      `/app-analysis/overview?os=ios&uai=${UAI}&country=KR`,
      `/app-analysis/keyword-rankings?os=ios&uai=${UAI}&country=KR`,
      `/aso/keyword-rankings?os=ios&uai=${UAI}&country=KR`,
      `/store-marketing/keyword-rankings?os=ios&uai=${UAI}&country=KR`,
      `/store-marketing/aso?os=ios&uai=${UAI}&country=KR`,
      `/app-analysis/keywords?os=ios&uai=${UAI}&country=KR`,
    ];

    for (const path of urlTests) {
      const testUrl = `https://app.sensortower.com${path}`;
      await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);
      const is404 = await page.locator('text=OH NO').first().isVisible({ timeout: 1000 }).catch(() => false);
      const finalUrl = page.url();
      const status = is404 ? '❌ 404' : '✅ OK';
      console.log(`   ${status} ${path}`);
      console.log(`         → ${finalUrl}`);

      if (!is404) {
        await page.screenshot({ path: join(SS, `nav2-4-hit-${Date.now()}.png`), fullPage: true });
      }
    }

    // 세션 갱신
    const state = await context.storageState();
    writeFileSync(AUTH_STATE_FILE, JSON.stringify(state));
    console.log('\n✅ 탐색 완료');

  } catch (e) {
    console.error('❌ 실패:', e.message);
    await page.screenshot({ path: join(SS, 'nav2-error.png') });
  } finally {
    await browser.close();
  }
}

testNavigate2();
