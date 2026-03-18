/**
 * Sensor Tower ASO 페이지 데이터 추출 테스트
 *
 * 1. ASO 성과 추적 페이지 → 스크롤 → 테이블 구조 캡처
 * 2. CSV 다운로드 시도
 * 3. iOS / Android 모두 테스트
 */
import { chromium } from 'playwright';
import { config } from './config.js';
import { join } from 'path';
import { existsSync, writeFileSync, mkdirSync, readdirSync } from 'fs';

const AUTH_STATE_FILE = join(config.paths.authState, 'st-session.json');
const SS = config.paths.screenshots;
const DL = join(config.paths.root, 'downloads');

async function testAsoData() {
  console.log('=== ASO 데이터 추출 테스트 ===\n');
  mkdirSync(SS, { recursive: true });
  mkdirSync(DL, { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({
    storageState: AUTH_STATE_FILE,
    acceptDownloads: true,
  });
  const page = await context.newPage();

  try {
    // === iOS ASO 성과 추적 ===
    console.log('[1] iOS ASO 성과 추적 페이지...');

    // /aso/keyword-rankings 가 자동으로 performance-tracking으로 리디렉트됨
    const asoUrl = 'https://app.sensortower.com/store-marketing/aso/performance-tracking?' +
      'os=ios&country=KR&device=iphone&' +
      'start_date=2026-03-11&end_date=2026-03-18&duration=P7D&' +
      'granularity=auto&page=1&page_size=100&' +
      'aso_keyword_rank_view=summary&metric=rank&' +
      'ssia=1270676408';

    await page.goto(asoUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('   페이지 로딩 대기...');
    await page.waitForTimeout(8000);
    console.log('   URL:', page.url());

    // 스크린샷 상단
    await page.screenshot({ path: join(SS, 'aso-1-top.png') });

    // 스크롤 다운해서 테이블 찾기
    console.log('   스크롤 다운...');
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(SS, 'aso-2-scroll1.png') });

    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(SS, 'aso-3-scroll2.png') });

    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(SS, 'aso-4-scroll3.png') });

    // 테이블 데이터 추출 시도
    console.log('\n[2] 테이블 데이터 추출...');
    const tableData = await page.evaluate(() => {
      const results = [];

      // 테이블 행 찾기
      const tables = document.querySelectorAll('table');
      for (const table of tables) {
        const headers = Array.from(table.querySelectorAll('thead th, thead td'))
          .map(h => h.textContent?.trim());
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td'))
            .map(c => c.textContent?.trim());
          results.push({ headers: headers.length > 0 ? headers : undefined, cells });
        });
      }

      // 테이블이 없으면 키워드 카드/리스트 형태일 수 있음
      if (results.length === 0) {
        // 키워드 관련 요소 찾기
        const kwElements = document.querySelectorAll(
          '[class*="keyword"], [class*="rank"], [data-testid*="keyword"]'
        );
        kwElements.forEach(el => {
          results.push({
            tag: el.tagName,
            className: el.className?.slice(0, 100),
            text: el.textContent?.trim()?.slice(0, 200),
          });
        });
      }

      return results;
    });

    writeFileSync(join(SS, 'aso-table-data.json'), JSON.stringify(tableData, null, 2));
    console.log(`   추출된 항목: ${tableData.length}개`);
    if (tableData.length > 0) {
      console.log('   첫 3개:', JSON.stringify(tableData.slice(0, 3), null, 2));
    }

    // 키워드별 순위 데이터 (상단 태그에서)
    console.log('\n[3] 키워드 순위 태그 추출...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    const keywordTags = await page.evaluate(() => {
      const results = [];
      // 상단에 보이는 키워드 태그들 (콴다 0, 수학 0, 수학문제풀이 ↑2 등)
      const allElements = document.querySelectorAll('button, span, div');
      for (const el of allElements) {
        const text = el.textContent?.trim() || '';
        // "키워드이름 숫자" 또는 "키워드이름 ↑숫자" 패턴
        if (text.match(/^.{1,20}\s+(↑|↓)?\d+$/) && el.children.length <= 3) {
          results.push(text);
        }
      }
      return [...new Set(results)];
    });
    console.log('   키워드 태그:', keywordTags);

    // === CSV 다운로드 시도 ===
    console.log('\n[4] CSV 다운로드 시도...');
    const csvBtn = page.locator('text=CSV, button:has-text("CSV"), [class*="csv"], [class*="download"]');
    try {
      await csvBtn.first().waitFor({ timeout: 5000 });
      console.log('   CSV 버튼 발견!');

      // 다운로드 이벤트 대기
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 15000 }),
        csvBtn.first().click(),
      ]);

      const filePath = join(DL, download.suggestedFilename());
      await download.saveAs(filePath);
      console.log(`   ✅ CSV 다운로드: ${filePath}`);

      // CSV 내용 미리보기
      const { readFileSync } = await import('fs');
      const csvContent = readFileSync(filePath, 'utf-8');
      const lines = csvContent.split('\n');
      console.log(`   행 수: ${lines.length}`);
      console.log('   헤더:', lines[0]);
      if (lines.length > 1) console.log('   첫 행:', lines[1]);
      if (lines.length > 2) console.log('   둘째 행:', lines[2]);
    } catch (e) {
      console.log('   CSV 다운로드 실패:', e.message);

      // CSV 드롭다운일 수 있음 - "CSV 다운로드" 텍스트로 재시도
      try {
        const csvBtn2 = page.locator('text=CSV 다운로드');
        await csvBtn2.first().click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: join(SS, 'aso-csv-dropdown.png') });

        // 드롭다운 메뉴 항목 클릭
        const menuItems = await page.evaluate(() => {
          const items = [];
          document.querySelectorAll('[role="menuitem"], [class*="dropdown"] a, [class*="menu"] li').forEach(el => {
            items.push(el.textContent?.trim());
          });
          return items;
        });
        console.log('   드롭다운 메뉴:', menuItems);
      } catch (e2) {
        console.log('   CSV 버튼 재시도 실패:', e2.message);
      }
    }

    // === "키워드 아이디어" 탭 확인 ===
    console.log('\n[5] "키워드 관리" 탭 확인...');
    try {
      const kwTab = page.locator('text=키워드 관리');
      await kwTab.first().click();
      await page.waitForTimeout(5000);
      console.log('   URL:', page.url());
      await page.screenshot({ path: join(SS, 'aso-5-kw-manage.png'), fullPage: true });

      // 키워드 리스트 추출
      const kwList = await page.evaluate(() => {
        const results = [];
        const rows = document.querySelectorAll('table tbody tr');
        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td')).map(c => c.textContent?.trim());
          if (cells.length > 0) results.push(cells);
        });

        // 테이블이 없으면 리스트 형태
        if (results.length === 0) {
          document.querySelectorAll('[class*="keyword-list"] *, [class*="keyword-item"] *').forEach(el => {
            const text = el.textContent?.trim();
            if (text && text.length < 50) results.push(text);
          });
        }
        return results.slice(0, 20);
      });
      console.log('   키워드 관리 데이터:', JSON.stringify(kwList.slice(0, 5), null, 2));
    } catch (e) {
      console.log('   키워드 관리 탭 실패:', e.message);
    }

    // 세션 갱신
    const state = await context.storageState();
    writeFileSync(AUTH_STATE_FILE, JSON.stringify(state));
    console.log('\n✅ 테스트 완료');

  } catch (e) {
    console.error('❌ 실패:', e.message);
    await page.screenshot({ path: join(SS, 'aso-error.png') });
  } finally {
    await browser.close();
  }
}

testAsoData();
