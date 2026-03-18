/**
 * 키워드 관리 - div 기반 테이블 구조 역추적
 */
import { chromium } from 'playwright';
import { config } from './config.js';
import { join } from 'path';
import { existsSync, writeFileSync, mkdirSync } from 'fs';

const AUTH_STATE_FILE = join(config.paths.authState, 'st-session.json');
const SS = config.paths.screenshots;

async function debug2() {
  console.log('=== div 기반 테이블 역추적 ===\n');
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

    // 1. "콴다" 텍스트를 포함하는 요소 찾기 → 상위 구조 역추적
    console.log('[1] "콴다" 텍스트 역추적...');
    const kwStructure = await page.evaluate(() => {
      // "콴다"를 포함하는 요소 찾기
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        { acceptNode: (node) => node.textContent?.trim() === '콴다' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT }
      );

      const results = [];
      let node;
      while ((node = walker.nextNode()) && results.length < 3) {
        let el = node.parentElement;
        const chain = [];

        // 5단계 상위 요소까지 추적
        for (let i = 0; i < 8 && el; i++) {
          chain.push({
            tag: el.tagName,
            className: el.className?.toString()?.slice(0, 150),
            role: el.getAttribute('role'),
            childCount: el.children.length,
          });
          el = el.parentElement;
        }
        results.push(chain);
      }
      return results;
    });

    console.log(JSON.stringify(kwStructure, null, 2));

    // 2. 키워드 셀 클래스로 형제/부모 구조 확인
    console.log('\n[2] AsoTableKeywordCell 구조...');
    const cellStructure = await page.evaluate(() => {
      const kwCells = document.querySelectorAll('[class*="AsoTableKeywordCell"]');
      if (kwCells.length === 0) return { found: 0 };

      const firstCell = kwCells[0];
      // 부모의 형제 요소들 (같은 "행"의 다른 "셀")
      const parent = firstCell.parentElement;
      const grandparent = parent?.parentElement;
      const greatGrandparent = grandparent?.parentElement;

      const siblings = (el) => {
        if (!el) return [];
        return Array.from(el.children).map(c => ({
          tag: c.tagName,
          className: c.className?.toString()?.slice(0, 100),
          text: c.textContent?.trim()?.slice(0, 50),
          childCount: c.children.length,
        }));
      };

      return {
        cellCount: kwCells.length,
        firstCellClass: firstCell.className?.toString(),
        firstCellText: firstCell.textContent?.trim(),
        parent: {
          tag: parent?.tagName,
          class: parent?.className?.toString()?.slice(0, 150),
          childCount: parent?.children?.length,
          siblings: siblings(parent),
        },
        grandparent: {
          tag: grandparent?.tagName,
          class: grandparent?.className?.toString()?.slice(0, 150),
          childCount: grandparent?.children?.length,
          siblings: siblings(grandparent)?.slice(0, 5),
        },
        greatGrandparent: {
          tag: greatGrandparent?.tagName,
          class: greatGrandparent?.className?.toString()?.slice(0, 150),
          childCount: greatGrandparent?.children?.length,
        },
      };
    });

    console.log(JSON.stringify(cellStructure, null, 2));

    // 3. "행" 레벨 요소에서 모든 "셀" 데이터 추출
    console.log('\n[3] 행 데이터 추출 시도...');
    const rowData = await page.evaluate(() => {
      const kwCells = document.querySelectorAll('[class*="AsoTableKeywordCell"]');
      if (kwCells.length === 0) return [];

      const results = [];

      kwCells.forEach((cell, idx) => {
        if (idx >= 5) return; // 첫 5개만

        // "행" 레벨 부모 찾기 (클래스에 "row"가 있거나 형제가 많은 요소)
        let rowEl = cell;
        for (let i = 0; i < 10; i++) {
          rowEl = rowEl.parentElement;
          if (!rowEl) break;
          const cls = rowEl.className?.toString() || '';
          if (cls.includes('row') || cls.includes('Row') || cls.includes('tr')) break;
          // 형제 요소가 여러개면 이게 "셀" 컨테이너
          if (rowEl.parentElement && rowEl.parentElement.children.length > 3) {
            // 이 rowEl의 형제들이 다른 셀들
            break;
          }
        }

        // rowEl의 형제들에서 텍스트 추출
        const rowParent = rowEl?.parentElement;
        const cellTexts = rowParent ? Array.from(rowParent.children).map(c => c.textContent?.trim()?.slice(0, 50)) : [];

        const keyword = cell.querySelector('[class*="keyword"]')?.textContent?.trim() || cell.textContent?.trim();

        results.push({
          keyword,
          rowElTag: rowEl?.tagName,
          rowElClass: rowEl?.className?.toString()?.slice(0, 100),
          cellTexts,
        });
      });

      return results;
    });

    console.log(JSON.stringify(rowData, null, 2));

    // 4. 전체 페이지에서 숫자 "1" (순위) 근처의 구조 탐색
    console.log('\n[4] 순위 숫자 근처 구조...');
    const rankStructure = await page.evaluate(() => {
      // "콴다" 키워드 요소 찾기
      const kwEl = document.querySelector('[class*="AsoTableKeywordCell"] [class*="keyword"]');
      if (!kwEl) return { noKeyword: true };

      // 같은 레벨 또는 인접 요소에서 숫자 찾기
      let container = kwEl;
      for (let i = 0; i < 10; i++) {
        container = container.parentElement;
        if (!container) break;

        // container 안의 모든 텍스트 노드
        const allText = container.innerText?.split('\n').filter(t => t.trim());
        if (allText && allText.length > 3) {
          return {
            level: i,
            tag: container.tagName,
            class: container.className?.toString()?.slice(0, 150),
            texts: allText.slice(0, 20),
            childCount: container.children.length,
          };
        }
      }

      return { maxLevelReached: true };
    });

    console.log(JSON.stringify(rankStructure, null, 2));

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

debug2();
