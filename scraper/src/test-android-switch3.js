/**
 * TreeView에서 Android 앱 "QANDA: AI Math Solver & Study" 클릭 → API 캡처
 */
import { chromium } from 'playwright';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const AUTH = join(process.cwd(), 'auth-state', 'st-session.json');
const SS = join(process.cwd(), 'screenshots');

async function run() {
  mkdirSync(SS, { recursive: true });
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ storageState: AUTH });
  const page = await context.newPage();

  const facetCalls = [];
  page.on('request', req => {
    if (req.url().includes('facets') && req.method() === 'POST') {
      facetCalls.push({ url: req.url(), body: req.postData(), time: Date.now() });
    }
  });
  page.on('response', async res => {
    if (res.url().includes('facets') && res.request().method() === 'POST') {
      try {
        const d = await res.json();
        console.log(`  [facets] status=${res.status()} count=${d.data?.length || 0} qid=${res.url().split('query_identifier=')[1]?.slice(0, 60)}`);
      } catch {}
    }
  });

  // 1. 페이지 로드
  console.log('[1] 페이지 로드...');
  await page.goto(
    'https://app.sensortower.com/store-marketing/aso/keyword-management?os=ios&country=KR&device=iphone&ssia=1270676408',
    { waitUntil: 'domcontentloaded', timeout: 60000 }
  );
  await page.waitForTimeout(10000);

  // 2. EntitySelector 열기
  console.log('\n[2] 앱 선택 드롭다운 열기...');
  await page.locator('[class*="AsoEntitySelector-module__buttonWrapper"]').first().click();
  await page.waitForTimeout(2000);

  // 3. TreeView 내 전체 treeitem 목록 확인
  console.log('\n[3] TreeView 아이템 목록...');
  const treeItems = await page.evaluate(() => {
    const items = document.querySelectorAll('[role="treeitem"]');
    return Array.from(items).map((el, i) => {
      // 직접 라벨 텍스트만 추출 (중첩 제외)
      const label = el.querySelector('[class*="MuiTreeItem-label"]');
      const nameEl = el.querySelector('[class*="selectorAppName"], [class*="selectorSubAppName"]');
      return {
        index: i,
        label: label?.textContent?.trim().slice(0, 80),
        name: nameEl?.textContent?.trim(),
        hasExpanded: el.querySelector('.Mui-expanded') !== null,
        ariaExpanded: el.getAttribute('aria-expanded'),
        depth: el.querySelectorAll('[role="group"]').length,
      };
    });
  });
  for (const item of treeItems) {
    console.log(`  [${item.index}] "${item.name || item.label}" expanded=${item.ariaExpanded}`);
  }

  // 4. Android 앱 = "QANDA: AI Math Solver & Study" treeitem 클릭
  console.log('\n[4] Android 앱 treeitem 클릭...');

  // 방법: selectorSubAppName 중 "Solver" 포함하는 것 클릭
  const clicked = await page.evaluate(() => {
    const names = document.querySelectorAll('[class*="selectorSubAppName"], [class*="selectorAppName"]');
    for (const el of names) {
      if (el.textContent?.includes('Solver')) {
        el.click();
        return el.textContent.trim();
      }
    }
    // Solver 없으면 두 번째 treeitem의 label 클릭
    const items = document.querySelectorAll('[role="treeitem"]');
    for (const item of items) {
      const label = item.querySelector('[class*="selectorSubAppName"]');
      if (label && !label.textContent.includes('Study Helper')) {
        label.click();
        return label.textContent.trim();
      }
    }
    return null;
  });
  console.log(`  클릭한 앱: ${clicked}`);

  if (!clicked) {
    // 텍스트 "Solver"로 직접 시도
    const solverEl = page.locator('text=Solver').first();
    if (await solverEl.isVisible().catch(() => false)) {
      await solverEl.click();
      console.log('  "Solver" 텍스트 클릭');
    } else {
      console.log('  Android 앱 요소를 찾을 수 없음');
      // 모든 selectorAppName/SubAppName 텍스트 출력
      const allNames = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[class*="selectorAppName"], [class*="selectorSubAppName"]'))
          .map(el => el.textContent?.trim());
      });
      console.log('  앱 이름 목록:', allNames);
    }
  }

  await page.waitForTimeout(3000);
  await page.screenshot({ path: join(SS, 'switch3-1-after-click.png') });

  // 5. 하위 트리 확인 — Android 앱의 "내 보기" 아래 뷰 목록
  console.log('\n[5] 하위 트리 확인...');
  const subTree = await page.evaluate(() => {
    const items = document.querySelectorAll('[role="treeitem"]');
    return Array.from(items).map((el, i) => {
      const name = el.querySelector('[class*="selectorAppName"], [class*="selectorSubAppName"], [class*="MuiTreeItem-label"]');
      return {
        index: i,
        text: name?.textContent?.trim().slice(0, 80) || el.textContent?.trim().slice(0, 80),
        expanded: el.getAttribute('aria-expanded'),
        selected: el.getAttribute('aria-selected'),
      };
    });
  });
  for (const item of subTree) {
    console.log(`  [${item.index}] "${item.text}" expanded=${item.expanded} selected=${item.selected}`);
  }

  // 6. Android 뷰 중 KR 뷰 클릭 시도
  console.log('\n[6] KR 뷰 클릭 시도...');
  // "콴다" 또는 "KR" 포함 treeitem 찾기
  const krClicked = await page.evaluate(() => {
    const items = document.querySelectorAll('[role="treeitem"]');
    for (const item of items) {
      const text = item.textContent?.trim();
      // Android 한국 뷰 = "콴다(QANDA):수학 문제풀이 AI 공부앱" 이름
      if (text?.includes('문제풀이') || text?.includes('수학 문제')) {
        const label = item.querySelector('[class*="MuiTreeItem-label"], [class*="MuiTreeItem-content"]');
        if (label) { label.click(); return text.slice(0, 60); }
      }
    }
    return null;
  });
  console.log(`  KR 뷰 클릭: ${krClicked}`);

  await page.waitForTimeout(10000);
  await page.screenshot({ path: join(SS, 'switch3-2-kr-view.png') });

  console.log(`\n전환 후 URL: ${page.url()}`);
  console.log(`총 facets 호출: ${facetCalls.length}`);

  // 마지막 facets body 저장
  if (facetCalls.length > 1) {
    const latest = facetCalls[facetCalls.length - 1];
    writeFileSync(join(SS, 'android-real-body.json'), latest.body);
    console.log('\n최신 facets body 저장됨');
    try {
      const p = JSON.parse(latest.body);
      console.log('  query_identifier:', latest.url.split('query_identifier=')[1]);
      console.log('  keyword_view_id:', p.filters?.keyword_view_id);
      console.log('  os:', p.filters?.os);
      console.log('  devices:', p.filters?.devices);
    } catch {}
  }

  const state = await context.storageState();
  writeFileSync(AUTH, JSON.stringify(state));
  console.log('\n✅ 완료');
  await browser.close();
}

run();
