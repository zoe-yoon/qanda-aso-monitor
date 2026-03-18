/**
 * Android treeitem 확장 → 한국 뷰 선택 → API 캡처
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
      facetCalls.push({ url: req.url(), body: req.postData() });
    }
  });
  page.on('response', async res => {
    if (res.url().includes('facets') && res.request().method() === 'POST') {
      try {
        const d = await res.json();
        console.log(`  [facets] status=${res.status()} count=${d.data?.length || 0} qid=${res.url().split('=')[1]?.slice(0, 60)}`);
      } catch {}
    }
  });

  // 1. 로드
  console.log('[1] 페이지 로드...');
  await page.goto(
    'https://app.sensortower.com/store-marketing/aso/keyword-management?os=ios&country=KR&device=iphone&ssia=1270676408',
    { waitUntil: 'domcontentloaded', timeout: 60000 }
  );
  await page.waitForTimeout(10000);

  // 2. EntitySelector 열기
  console.log('[2] 앱 선택 열기...');
  await page.locator('[class*="AsoEntitySelector-module__buttonWrapper"]').first().click();
  await page.waitForTimeout(2000);

  // 3. 현재 treeitem 목록
  const listItems = async (label) => {
    const items = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[role="treeitem"]')).map((el, i) => ({
        i,
        text: el.querySelector('[class*="MuiTreeItem-label"]')?.textContent?.trim().slice(0, 60) || el.textContent?.trim().slice(0, 60),
        expanded: el.getAttribute('aria-expanded'),
        selected: el.getAttribute('aria-selected'),
      }));
    });
    console.log(`\n[${label}] TreeView:`);
    items.forEach(it => console.log(`  [${it.i}] "${it.text}" exp=${it.expanded} sel=${it.selected}`));
    return items;
  };

  await listItems('3-초기');

  // 4. Android treeitem (index 4) 확장 — expand 아이콘 클릭
  console.log('\n[4] Android 앱 확장...');

  // MuiTreeItem의 expand 아이콘은 content 영역의 iconContainer 안에 있음
  const expanded = await page.evaluate(() => {
    const items = document.querySelectorAll('[role="treeitem"]');
    // index 4 = Android 앱
    const androidItem = items[4];
    if (!androidItem) return 'item not found';

    // 확장 아이콘 클릭 (MuiTreeItem-iconContainer)
    const iconContainer = androidItem.querySelector('[class*="MuiTreeItem-iconContainer"], [class*="iconContainer"]');
    if (iconContainer) {
      iconContainer.click();
      return 'icon clicked';
    }

    // 또는 content 영역의 expand 버튼
    const expandBtn = androidItem.querySelector('svg, [class*="expand"], [class*="arrow"], [class*="toggle"]');
    if (expandBtn) {
      expandBtn.click();
      return 'expand clicked';
    }

    // 또는 label 더블클릭
    const content = androidItem.querySelector('[class*="MuiTreeItem-content"]');
    if (content) {
      content.click();
      return 'content clicked';
    }

    return 'nothing to click';
  });
  console.log(`  결과: ${expanded}`);
  await page.waitForTimeout(3000);

  await listItems('4-확장후');
  await page.screenshot({ path: join(SS, 'switch4-1-expanded.png') });

  // 5. 하위 뷰 중 한국 뷰 (콴다 관련) 클릭
  console.log('\n[5] 한국 뷰 클릭...');

  // 모든 treeitem 중 Android 뷰에 해당하는 것 찾기
  const viewClicked = await page.evaluate(() => {
    const items = document.querySelectorAll('[role="treeitem"]');
    const results = [];

    for (let i = 0; i < items.length; i++) {
      const text = items[i].textContent?.trim();
      results.push(`[${i}] ${text?.slice(0, 60)}`);

      // Android 한국 뷰: "콴다" 또는 "수학 문제풀이" 포함, 또는 "내 보기" 아래
      // iOS 뷰 이후에 나오는 뷰를 찾아야 함
      if (i >= 4) {  // Android 앱(4) 이후
        const label = items[i].querySelector('[class*="MuiTreeItem-label"]');
        const labelText = label?.textContent?.trim() || '';

        // "내 보기" 아래의 개별 뷰 클릭
        if (labelText && !labelText.includes('QANDA') && !labelText.includes('Mathpresso') &&
            !labelText.includes('내 보기') && labelText.length < 30) {
          const content = items[i].querySelector('[class*="MuiTreeItem-content"]');
          if (content) {
            content.click();
            return { clicked: labelText, index: i };
          }
        }
      }
    }

    return { clicked: null, allItems: results };
  });
  console.log(`  결과:`, JSON.stringify(viewClicked));

  if (!viewClicked.clicked) {
    // 확장이 안 됐을 수 있으니, treeitem[4]를 직접 더블클릭
    console.log('\n[5b] Android treeitem 더블클릭 시도...');
    const item4 = page.locator('[role="treeitem"]').nth(4);
    await item4.dblclick();
    await page.waitForTimeout(3000);
    await listItems('5b-더블클릭후');

    // 다시 뷰 목록 확인
    const allTexts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[role="treeitem"]')).map((el, i) => ({
        i, text: el.textContent?.trim().slice(0, 80),
        expanded: el.getAttribute('aria-expanded'),
      }));
    });
    console.log('  전체 treeitem:', JSON.stringify(allTexts, null, 2));
  }

  await page.waitForTimeout(8000);
  await page.screenshot({ path: join(SS, 'switch4-2-final.png') });

  console.log(`\n최종 URL: ${page.url()}`);
  console.log(`facets 호출 수: ${facetCalls.length}`);

  if (facetCalls.length > 1) {
    const latest = facetCalls[facetCalls.length - 1];
    writeFileSync(join(SS, 'android-real-body.json'), latest.body);
    try {
      const p = JSON.parse(latest.body);
      console.log('\n--- Android API body ---');
      console.log('  query_identifier:', latest.url.split('query_identifier=')[1]);
      console.log('  keyword_view_id:', p.filters?.keyword_view_id);
      console.log('  os:', p.filters?.os);
      console.log('  devices:', p.filters?.devices);
      console.log('  regions:', p.filters?.regions);
      console.log('  facets:', p.facets?.length);
    } catch {}
  }

  const state = await context.storageState();
  writeFileSync(AUTH, JSON.stringify(state));
  console.log('\n✅ 완료');
  await browser.close();
}

run();
