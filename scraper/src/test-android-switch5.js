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

  const listTree = async (label) => {
    const items = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[role="treeitem"]')).map((el, i) => ({
        i,
        text: el.querySelector('[class*="MuiTreeItem-label"]')?.textContent?.trim().slice(0, 60),
        expanded: el.getAttribute('aria-expanded'),
        selected: el.getAttribute('aria-selected'),
      }))
    );
    console.log(`\n[${label}]`);
    items.forEach(it => console.log(`  [${it.i}] "${it.text}" exp=${it.expanded} sel=${it.selected}`));
    return items;
  };

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
  await listTree('초기');

  // 3. Android treeitem[4] — Playwright로 클릭하여 확장
  console.log('\n[3] Android 앱 확장 — treeitem[4] 클릭...');
  const androidItem = page.locator('[role="treeitem"]').nth(4);
  await androidItem.locator('[class*="MuiTreeItem-content"]').first().click();
  await page.waitForTimeout(3000);
  await listTree('확장후');
  await page.screenshot({ path: join(SS, 'sw5-1-expanded.png') });

  // 4. 확장 안 됐으면 iconContainer 클릭 시도
  const items = await page.locator('[role="treeitem"]').count();
  if (items <= 5) {
    console.log('\n[4] iconContainer 클릭 시도...');
    const iconBtn = androidItem.locator('[class*="iconContainer"]').first();
    if (await iconBtn.isVisible().catch(() => false)) {
      await iconBtn.click();
      await page.waitForTimeout(3000);
      await listTree('icon클릭후');
    } else {
      // 확장 화살표 직접 클릭
      console.log('  iconContainer 없음 — 확장 화살표 찾기...');
      const expandIcon = androidItem.locator('svg').first();
      if (await expandIcon.isVisible().catch(() => false)) {
        await expandIcon.click({ force: true });
        await page.waitForTimeout(3000);
        await listTree('svg클릭후');
      }
    }
  }

  await page.screenshot({ path: join(SS, 'sw5-2-tree.png') });

  // 5. 하위 뷰 목록에서 한국 뷰 선택
  console.log('\n[5] 뷰 선택...');
  const allItems = await page.locator('[role="treeitem"]').all();
  console.log(`  총 treeitem: ${allItems.length}개`);

  for (let i = 4; i < allItems.length; i++) {
    const text = await allItems[i].textContent().catch(() => '');
    const shortText = text.trim().slice(0, 60);
    console.log(`  [${i}] "${shortText}"`);

    // "콴다" (Korean view name) 포함하는 뷰 클릭 — iOS의 "콴다"가 아닌 Android 하위의 것
    if (i > 4 && (shortText.includes('콴다') || shortText.includes('수학 문제풀이'))) {
      console.log(`  → 클릭: [${i}]`);
      const content = allItems[i].locator('[class*="MuiTreeItem-content"]').first();
      await content.click();
      await page.waitForTimeout(10000);
      break;
    }
  }

  await page.screenshot({ path: join(SS, 'sw5-3-final.png') });
  console.log(`\n최종 URL: ${page.url()}`);
  console.log(`facets 호출: ${facetCalls.length}`);

  if (facetCalls.length > 1) {
    const latest = facetCalls[facetCalls.length - 1];
    writeFileSync(join(SS, 'android-real-body.json'), latest.body);
    try {
      const p = JSON.parse(latest.body);
      console.log('\n--- Android API ---');
      console.log('query_identifier:', latest.url.split('query_identifier=')[1]);
      console.log('keyword_view_id:', p.filters?.keyword_view_id);
      console.log('os:', p.filters?.os);
      console.log('devices:', JSON.stringify(p.filters?.devices));
      console.log('regions:', JSON.stringify(p.filters?.regions));
    } catch {}
  }

  const state = await context.storageState();
  writeFileSync(AUTH, JSON.stringify(state));
  console.log('\n✅ 완료');
  await browser.close();
}

run();
