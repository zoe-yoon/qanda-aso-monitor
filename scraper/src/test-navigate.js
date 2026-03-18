/**
 * Sensor Tower URL 구조 탐색
 *
 * 검색으로 콴다 앱을 찾고, 실제 페이지 URL 패턴을 파악
 */
import { chromium } from 'playwright';
import { config } from './config.js';
import { join } from 'path';
import { existsSync, writeFileSync, mkdirSync } from 'fs';

const AUTH_STATE_FILE = join(config.paths.authState, 'st-session.json');
const SS = config.paths.screenshots;

async function testNavigate() {
  console.log('=== Sensor Tower URL 구조 탐색 ===\n');

  mkdirSync(SS, { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ storageState: AUTH_STATE_FILE });
  const page = await context.newPage();

  try {
    // 1. 메인 페이지
    await page.goto('https://app.sensortower.com', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(3000);
    console.log('[1] 메인 URL:', page.url());

    // 2. 검색창에서 "콴다" 검색
    console.log('\n[2] 검색창에서 "QANDA" 검색...');
    const searchInput = page.locator('input[placeholder*="검색"], input[placeholder*="Search"], input[type="search"], [class*="search"] input');

    try {
      await searchInput.first().waitFor({ timeout: 5000 });
      await searchInput.first().click();
      await page.waitForTimeout(500);
      await searchInput.first().fill('QANDA');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: join(SS, 'nav-2-search.png') });

      // 검색 결과에서 링크 수집
      const searchLinks = await page.evaluate(() => {
        const links = [];
        document.querySelectorAll('a[href]').forEach(a => {
          const href = a.getAttribute('href');
          const text = a.textContent?.trim();
          if (text && (text.includes('QANDA') || text.includes('콴다') || text.includes('1150247800') || text.includes('mathpresso'))) {
            links.push({ href, text: text.slice(0, 100) });
          }
        });
        return links;
      });
      console.log('   검색 결과 링크:', JSON.stringify(searchLinks, null, 2));

      // 검색 결과 클릭
      const qandaLink = page.locator('a:has-text("QANDA"), a:has-text("콴다")');
      if (await qandaLink.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await qandaLink.first().click();
        await page.waitForTimeout(3000);
        console.log('   앱 페이지 URL:', page.url());
        await page.screenshot({ path: join(SS, 'nav-3-app-page.png'), fullPage: true });
      }
    } catch (e) {
      console.log('   검색창 접근 실패:', e.message);
    }

    // 3. 네비게이션 메뉴 구조 파악
    console.log('\n[3] 네비게이션 메뉴 탐색...');

    // "앱 분석" 메뉴 클릭
    const appAnalysis = page.locator('text=앱 분석, text=App Intelligence');
    try {
      await appAnalysis.first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: join(SS, 'nav-4-app-menu.png') });

      // 서브메뉴 링크 수집
      const menuLinks = await page.evaluate(() => {
        const links = [];
        document.querySelectorAll('a[href], button').forEach(el => {
          const href = el.getAttribute('href') || '';
          const text = el.textContent?.trim() || '';
          if (text.length > 0 && text.length < 50 && (
            href.includes('keyword') || href.includes('ranking') ||
            href.includes('overview') || href.includes('category') ||
            text.includes('키워드') || text.includes('Keyword') ||
            text.includes('순위') || text.includes('Ranking') ||
            text.includes('카테고리') || text.includes('Category') ||
            text.includes('ASO') || text.includes('aso')
          )) {
            links.push({ href, text });
          }
        });
        return links;
      });
      console.log('   관련 메뉴:', JSON.stringify(menuLinks, null, 2));
    } catch (e) {
      console.log('   앱 분석 메뉴 접근 실패:', e.message);
    }

    // 4. 전체 페이지의 모든 네비게이션 링크 수집
    console.log('\n[4] 전체 네비게이션 링크 수집...');
    const allNavLinks = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll('nav a[href], header a[href], [class*="nav"] a[href], [class*="menu"] a[href], [class*="sidebar"] a[href]').forEach(a => {
        const href = a.getAttribute('href');
        const text = a.textContent?.trim();
        if (href && text && text.length < 80) {
          links.push({ href, text });
        }
      });
      return links;
    });

    writeFileSync(join(SS, 'nav-all-links.json'), JSON.stringify(allNavLinks, null, 2));
    console.log(`   총 ${allNavLinks.length}개 링크 저장됨`);

    // 주요 링크만 출력
    const keyLinks = allNavLinks.filter(l =>
      l.href.includes('keyword') || l.href.includes('aso') ||
      l.href.includes('ranking') || l.href.includes('overview') ||
      l.href.includes('category') || l.href.includes('search')
    );
    if (keyLinks.length > 0) {
      console.log('   키워드/랭킹 관련:', JSON.stringify(keyLinks, null, 2));
    }

    // 5. 직접 알려진 Sensor Tower URL 패턴들 시도
    console.log('\n[5] 다양한 URL 패턴 테스트...');
    const urlPatterns = [
      '/v2/ios/keyword-rankings/1150247800',
      '/ios/us/app/1150247800/keywords',
      '/app/ios/1150247800',
      '/overview/1150247800',
      '/aso/keyword-rankings?app_id=1150247800&os=ios&country=KR',
      '/app-intelligence/keyword-rankings?app_id=1150247800',
      '/explorer/keyword-rankings/ios/1150247800',
    ];

    for (const pattern of urlPatterns) {
      const testUrl = `https://app.sensortower.com${pattern}`;
      await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1500);
      const is404 = await page.locator('text=404, text=not found, text=OH NO').first().isVisible({ timeout: 1000 }).catch(() => false);
      const finalUrl = page.url();
      console.log(`   ${pattern} → ${is404 ? '404' : finalUrl}`);

      if (!is404 && !finalUrl.includes('404')) {
        await page.screenshot({ path: join(SS, `nav-5-found-${pattern.replace(/\//g, '_')}.png`) });
        break;
      }
    }

    // 세션 갱신
    const state = await context.storageState();
    writeFileSync(AUTH_STATE_FILE, JSON.stringify(state));
    console.log('\n✅ 탐색 완료, 세션 갱신됨');

  } catch (e) {
    console.error('❌ 탐색 실패:', e.message);
    await page.screenshot({ path: join(SS, 'nav-error.png') });
  } finally {
    await browser.close();
  }
}

testNavigate();
