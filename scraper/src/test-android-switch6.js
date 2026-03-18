/**
 * Android 뷰 [5] "내 보기" 또는 [6] "kr_play store" 클릭 → API 캡처
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
      console.log(`  [REQ] POST facets qid=${req.url().split('=')[1]?.slice(0, 60)}`);
    }
  });
  page.on('response', async res => {
    if (res.url().includes('facets') && res.request().method() === 'POST') {
      try {
        const d = await res.json();
        console.log(`  [RES] status=${res.status()} count=${d.data?.length || 0}`);
        if (d.data?.[0]) console.log(`  [RES] first: ${d.data[0].keyword} rank=${d.data[0].keyword_rank}`);
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

  // 2. EntitySelector 열기 + Android 확장
  console.log('\n[2] 앱 선택 열기 + Android 확장...');
  await page.locator('[class*="AsoEntitySelector-module__buttonWrapper"]').first().click();
  await page.waitForTimeout(2000);

  // Android treeitem[4] 클릭하여 확장
  await page.locator('[role="treeitem"]').nth(4).locator('[class*="MuiTreeItem-content"]').first().click();
  await page.waitForTimeout(3000);

  // 확인
  const count = await page.locator('[role="treeitem"]').count();
  console.log(`  treeitem 수: ${count}`);

  // 3. "내 보기" 클릭 (item[5])
  console.log('\n[3] "내 보기" (item[5]) 클릭...');
  const beforeCount = facetCalls.length;
  await page.locator('[role="treeitem"]').nth(5).locator('[class*="MuiTreeItem-content"]').first().click();
  await page.waitForTimeout(10000);

  console.log(`  URL: ${page.url().slice(0, 200)}`);
  console.log(`  새 facets: ${facetCalls.length - beforeCount}개`);
  await page.screenshot({ path: join(SS, 'sw6-1-myview.png') });

  if (facetCalls.length > beforeCount) {
    const latest = facetCalls[facetCalls.length - 1];
    writeFileSync(join(SS, 'android-myview-body.json'), latest.body);
    console.log('\n  --- "내 보기" API ---');
    try {
      const p = JSON.parse(latest.body);
      console.log('  qid:', latest.url.split('query_identifier=')[1]);
      console.log('  keyword_view_id:', p.filters?.keyword_view_id);
      console.log('  os:', p.filters?.os);
      console.log('  devices:', JSON.stringify(p.filters?.devices));
    } catch {}
  }

  // 4. "kr_play store 키워드 순위" 클릭 (item[6])
  // 먼저 다시 selector 열기 (닫혔을 수 있음)
  console.log('\n[4] "kr_play store" (item[6]) 클릭...');
  const selectorBtn = page.locator('[class*="AsoEntitySelector-module__buttonWrapper"]').first();
  if (await selectorBtn.isVisible().catch(() => false)) {
    await selectorBtn.click();
    await page.waitForTimeout(2000);
    // Android 다시 확장
    const treeCount = await page.locator('[role="treeitem"]').count();
    if (treeCount <= 5) {
      await page.locator('[role="treeitem"]').nth(4).locator('[class*="MuiTreeItem-content"]').first().click();
      await page.waitForTimeout(2000);
    }
  }

  const beforeCount2 = facetCalls.length;
  const treeCount2 = await page.locator('[role="treeitem"]').count();
  if (treeCount2 >= 7) {
    await page.locator('[role="treeitem"]').nth(6).locator('[class*="MuiTreeItem-content"]').first().click();
    await page.waitForTimeout(10000);

    console.log(`  URL: ${page.url().slice(0, 200)}`);
    console.log(`  새 facets: ${facetCalls.length - beforeCount2}개`);
    await page.screenshot({ path: join(SS, 'sw6-2-krplay.png') });

    if (facetCalls.length > beforeCount2) {
      const latest = facetCalls[facetCalls.length - 1];
      writeFileSync(join(SS, 'android-krplay-body.json'), latest.body);
      console.log('\n  --- "kr_play store" API ---');
      try {
        const p = JSON.parse(latest.body);
        console.log('  qid:', latest.url.split('query_identifier=')[1]);
        console.log('  keyword_view_id:', p.filters?.keyword_view_id);
        console.log('  os:', p.filters?.os);
        console.log('  devices:', JSON.stringify(p.filters?.devices));
      } catch {}
    }
  } else {
    console.log(`  treeitem ${treeCount2}개 — item[6] 없음`);
  }

  const state = await context.storageState();
  writeFileSync(AUTH, JSON.stringify(state));
  console.log('\n✅ 완료');
  await browser.close();
}

run();
