/**
 * 키워드 관리 테이블 HTML 구조 디버그
 */
import { chromium } from 'playwright';
import { config } from './config.js';
import { join } from 'path';
import { existsSync, writeFileSync, mkdirSync } from 'fs';

const AUTH_STATE_FILE = join(config.paths.authState, 'st-session.json');
const SS = config.paths.screenshots;

async function debug() {
  console.log('=== 테이블 구조 디버그 ===\n');
  mkdirSync(SS, { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: AUTH_STATE_FILE });
  const page = await context.newPage();

  try {
    const url = 'https://app.sensortower.com/store-marketing/aso/keyword-management?' +
      'os=ios&country=KR&device=iphone&ssia=1270676408&page=1&page_size=100';

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('페이지 로딩 대기 (10초)...');
    await page.waitForTimeout(10000);

    // 쿠키 배너 닫기
    const closeBtn = page.locator('text=모두 동의');
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }

    // 1. 테이블 존재 여부 확인
    const tableInfo = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      return {
        tableCount: tables.length,
        tables: Array.from(tables).map((t, i) => ({
          index: i,
          theadRows: t.querySelectorAll('thead tr').length,
          tbodyRows: t.querySelectorAll('tbody tr').length,
          totalRows: t.querySelectorAll('tr').length,
          // 첫 번째 tbody tr의 HTML
          firstRowHTML: t.querySelector('tbody tr')?.innerHTML?.slice(0, 500),
          // 두 번째 tbody tr의 HTML (첫 행이 "총합"일 수 있으므로)
          secondRowHTML: t.querySelectorAll('tbody tr')[1]?.innerHTML?.slice(0, 500),
          // 헤더
          headers: Array.from(t.querySelectorAll('thead th')).map(h => h.textContent?.trim()),
        })),
      };
    });

    console.log('\n[1] 테이블 정보:', JSON.stringify(tableInfo, null, 2));

    // 2. 첫 번째 데이터 행 상세 분석
    const rowDetail = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      for (const table of tables) {
        const rows = table.querySelectorAll('tbody tr');
        if (rows.length < 2) continue;

        // 두 번째 행 (첫 행이 "총합"일 수 있음)
        const dataRow = rows[1] || rows[0];
        const cells = dataRow.querySelectorAll('td');

        return {
          rowTagName: dataRow.tagName,
          cellCount: cells.length,
          cells: Array.from(cells).map((c, i) => ({
            index: i,
            text: c.textContent?.trim(),
            innerHTML: c.innerHTML?.slice(0, 300),
            childCount: c.children.length,
          })),
        };
      }

      // 테이블이 없는 경우 - div 기반 테이블일 수 있음
      const gridRows = document.querySelectorAll('[role="row"], [class*="row"]');
      return {
        noStandardTable: true,
        gridRowCount: gridRows.length,
        firstGridRow: gridRows[0]?.innerHTML?.slice(0, 500),
      };
    });

    console.log('\n[2] 행 상세:', JSON.stringify(rowDetail, null, 2));

    // 3. 스크롤해서 전체 행 로딩 확인
    console.log('\n[3] 스크롤 테스트...');

    // 테이블 영역으로 스크롤
    await page.evaluate(() => {
      const table = document.querySelector('table');
      if (table) table.scrollIntoView();
    });
    await page.waitForTimeout(2000);

    // 테이블 내부 스크롤 (가상 스크롤일 수 있음)
    const scrollableInfo = await page.evaluate(() => {
      const table = document.querySelector('table');
      if (!table) return { noTable: true };

      const tbody = table.querySelector('tbody');
      const parent = table.parentElement;

      return {
        tbodyRows: tbody?.querySelectorAll('tr')?.length,
        tbodyHeight: tbody?.scrollHeight,
        parentOverflow: parent ? getComputedStyle(parent).overflow : 'N/A',
        parentHeight: parent?.clientHeight,
        parentScrollHeight: parent?.scrollHeight,
      };
    });

    console.log('   스크롤 정보:', JSON.stringify(scrollableInfo, null, 2));

    // 4. 직접 데이터 추출 시도
    console.log('\n[4] 데이터 추출 시도...');
    const extractedData = await page.evaluate(() => {
      const results = [];
      const rows = document.querySelectorAll('table tbody tr');

      rows.forEach((row, idx) => {
        const tds = row.querySelectorAll('td');
        const rowData = {
          idx,
          cellTexts: Array.from(tds).map(td => td.textContent?.trim()),
        };
        results.push(rowData);
      });

      return results.slice(0, 10); // 첫 10행만
    });

    console.log('   추출:', JSON.stringify(extractedData, null, 2));

    // 세션 갱신
    const state = await context.storageState();
    writeFileSync(AUTH_STATE_FILE, JSON.stringify(state));
    console.log('\n✅ 디버그 완료');

  } catch (e) {
    console.error('❌ 실패:', e.message);
  } finally {
    await browser.close();
  }
}

debug();
