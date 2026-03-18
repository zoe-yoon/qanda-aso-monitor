/**
 * AsoEntitySelector로 Android 앱 전환 → API 캡처
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
        console.log(`  [facets] status=${res.status()} count=${d.data?.length || 0} url=${res.url().split('?')[1]?.slice(0, 80)}`);
      } catch {}
    }
  });

  // 1. 페이지 로드
  console.log('[1] 키워드 관리 페이지 로드...');
  await page.goto(
    'https://app.sensortower.com/store-marketing/aso/keyword-management?os=ios&country=KR&device=iphone&ssia=1270676408',
    { waitUntil: 'domcontentloaded', timeout: 60000 }
  );
  await page.waitForTimeout(10000);
  console.log(`  iOS facets 완료: ${facetCalls.length}개`);

  // 2. AsoEntitySelector 버튼 클릭
  console.log('\n[2] 앱 선택 버튼 클릭...');
  const selectorBtn = page.locator('[class*="AsoEntitySelector-module__buttonWrapper"]').first();
  await selectorBtn.waitFor({ timeout: 5000 });
  await selectorBtn.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(SS, 'switch2-1-selector-open.png') });

  // 드롭다운/모달 내용 탐색
  const dropdownContent = await page.evaluate(() => {
    const results = [];
    // 모달/팝오버/드롭다운 안의 앱 목록
    const candidates = document.querySelectorAll(
      '[role="listbox"] [role="option"], ' +
      '[role="menu"] [role="menuitem"], ' +
      '[class*="Popover"] li, ' +
      '[class*="popover"] li, ' +
      '[class*="Modal"] li, ' +
      '[class*="modal"] li, ' +
      '[class*="dropdown"] li, ' +
      '[class*="Dropdown"] li, ' +
      '[class*="MuiPopover"] *, ' +
      '[class*="MuiMenu"] [role="menuitem"], ' +
      '[class*="EntitySelector"] *, ' +
      'ul li'
    );
    for (const el of candidates) {
      const text = el.textContent?.trim();
      if (text && text.length > 2 && text.length < 200) {
        results.push({
          tag: el.tagName,
          text: text.slice(0, 100),
          class: el.className?.toString().slice(0, 100),
          role: el.getAttribute('role'),
        });
      }
    }
    return results.slice(0, 30);
  });
  console.log('  드롭다운 내용:', JSON.stringify(dropdownContent, null, 2));

  // 3. Android 관련 요소 찾기
  console.log('\n[3] Android 앱 선택...');

  // 방법 A: "android" 또는 패키지명 텍스트
  let clicked = false;
  for (const text of ['문제풀이 AI', 'com.mathpresso', 'Android', 'android']) {
    const el = page.locator(`text=${text}`).first();
    if (await el.isVisible().catch(() => false)) {
      console.log(`  "${text}" 발견 — 클릭`);
      await el.click();
      clicked = true;
      break;
    }
  }

  if (!clicked) {
    // 방법 B: 팝업/모달 안에서 두 번째 앱 아이콘 클릭
    console.log('  텍스트 매칭 실패 — MUI Popover 내 요소 탐색');
    const popoverItems = await page.evaluate(() => {
      const popover = document.querySelector('[class*="MuiPopover-root"], [class*="MuiModal-root"], [class*="MuiDrawer"]');
      if (!popover) return { found: false };
      return {
        found: true,
        html: popover.innerHTML.slice(0, 2000),
        textContent: popover.textContent?.slice(0, 500),
      };
    });
    console.log('  Popover:', JSON.stringify(popoverItems, null, 2));

    if (popoverItems.found) {
      // Popover 안의 클릭 가능한 요소들
      const clickables = await page.locator('[class*="MuiPopover-root"] button, [class*="MuiPopover-root"] [role="button"], [class*="MuiPopover-root"] a, [class*="MuiPopover-root"] li').all();
      console.log(`  Popover 내 클릭 가능: ${clickables.length}개`);
      for (const el of clickables) {
        const t = await el.textContent().catch(() => '');
        console.log(`    - "${t.trim().slice(0, 60)}"`);
      }
    }
  }

  if (clicked) {
    await page.waitForTimeout(10000);
    await page.screenshot({ path: join(SS, 'switch2-2-android.png') });
    console.log(`  전환 후 URL: ${page.url()}`);
    console.log(`  총 facets 호출: ${facetCalls.length}`);

    // 새 Android API 캡처
    const latest = facetCalls[facetCalls.length - 1];
    if (latest?.body) {
      writeFileSync(join(SS, 'android-real-body.json'), latest.body);
      console.log('\n[4] 최신 facets body 저장: screenshots/android-real-body.json');
      try {
        const p = JSON.parse(latest.body);
        console.log('  query_id:', latest.url.split('query_identifier=')[1]);
        console.log('  keyword_view_id:', p.filters?.keyword_view_id);
        console.log('  os:', p.filters?.os);
        console.log('  devices:', p.filters?.devices);
        console.log('  regions:', p.filters?.regions);
      } catch {}
    }
  }

  const state = await context.storageState();
  writeFileSync(AUTH, JSON.stringify(state));
  console.log('\n✅ 완료');
  await browser.close();
}

run();
