/**
 * UI에서 Android 앱으로 전환 → 실제 API 요청 캡처
 */
import { chromium } from 'playwright';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const AUTH = join(process.cwd(), 'auth-state', 'st-session.json');
const SS = join(process.cwd(), 'screenshots');

async function run() {
  mkdirSync(SS, { recursive: true });
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ storageState: AUTH });
  const page = await context.newPage();

  // facets 요청 캡처
  const facetCalls = [];
  page.on('request', req => {
    if (req.url().includes('facets') && req.method() === 'POST') {
      facetCalls.push({
        url: req.url(),
        body: req.postData(),
        time: Date.now(),
      });
    }
  });

  page.on('response', async res => {
    if (res.url().includes('facets') && res.request().method() === 'POST') {
      try {
        const d = await res.json();
        console.log(`  [facets 응답] status=${res.status()} count=${d.data?.length || 0}`);
      } catch {}
    }
  });

  // 1. iOS 키워드 관리 페이지 로드 (기본)
  console.log('[1] 키워드 관리 페이지 로드...');
  await page.goto(
    'https://app.sensortower.com/store-marketing/aso/keyword-management?os=ios&country=KR&device=iphone&ssia=1270676408',
    { waitUntil: 'domcontentloaded', timeout: 60000 }
  );
  await page.waitForTimeout(10000);
  await page.screenshot({ path: join(SS, 'switch-1-ios-loaded.png') });
  console.log(`  facets 호출 수: ${facetCalls.length}`);

  // 2. 앱 전환 UI 찾기 — 앱 이름/아이콘 클릭 영역 탐색
  console.log('\n[2] 앱 전환 UI 탐색...');

  // 앱 선택 드롭다운/버튼 찾기
  const appSwitchCandidates = await page.evaluate(() => {
    const results = [];
    // 앱 이름이 보이는 요소들
    const allEls = document.querySelectorAll('button, [role="button"], [role="combobox"], [class*="app"], [class*="select"], [class*="dropdown"], [class*="switcher"]');
    for (const el of allEls) {
      const text = el.textContent?.trim().slice(0, 80);
      const cls = el.className?.toString().slice(0, 100);
      if (text && (text.includes('콴다') || text.includes('QANDA') || cls?.includes('app') || cls?.includes('select'))) {
        results.push({
          tag: el.tagName,
          text: text.slice(0, 60),
          class: cls?.slice(0, 80),
          role: el.getAttribute('role'),
          id: el.id,
        });
      }
    }
    return results;
  });
  console.log('  앱 관련 요소:', JSON.stringify(appSwitchCandidates, null, 2));

  // TreeView/사이드바에서 앱 목록 찾기
  const treeItems = await page.evaluate(() => {
    const results = [];
    const items = document.querySelectorAll('[class*="TreeView"], [class*="treeview"], [class*="sidebar"] li, [class*="AppList"] li, [role="treeitem"], [class*="UserApp"]');
    for (const el of items) {
      results.push({
        tag: el.tagName,
        text: el.textContent?.trim().slice(0, 80),
        class: el.className?.toString().slice(0, 100),
      });
    }
    return results;
  });
  console.log('  트리/사이드바:', JSON.stringify(treeItems.slice(0, 10), null, 2));

  // 3. "Android" 또는 패키지명 포함 요소 클릭 시도
  console.log('\n[3] Android 앱 전환 시도...');
  const beforeCount = facetCalls.length;

  // 방법 A: 사이드바/리스트에서 Android 앱 찾기
  const androidEl = await page.locator('text=콴다(QANDA):수학 문제풀이').first();
  const androidElVisible = await androidEl.isVisible().catch(() => false);

  if (androidElVisible) {
    console.log('  Android 앱 요소 발견 — 클릭');
    await androidEl.click();
    await page.waitForTimeout(8000);
  } else {
    // 방법 B: 앱 선택 드롭다운 열기
    console.log('  직접 요소 없음 — 드롭다운/셀렉터 찾기');

    // 앱 아이콘+이름 영역 클릭
    const appHeader = await page.locator('[class*="UserApp"], [class*="app-header"], [class*="AppSelector"]').first();
    if (await appHeader.isVisible().catch(() => false)) {
      console.log('  앱 헤더 클릭');
      await appHeader.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: join(SS, 'switch-2-dropdown.png') });

      // 드롭다운에서 Android 앱 선택
      const androidOption = await page.locator('text=수학 문제풀이').first();
      if (await androidOption.isVisible().catch(() => false)) {
        await androidOption.click();
        await page.waitForTimeout(8000);
      }
    } else {
      // 방법 C: 사이드 패널 토글
      console.log('  사이드 패널 탐색...');
      // 왼쪽 사이드바의 앱 리스트 확인
      const sidebar = await page.locator('[class*="sidebar"], [class*="Sidebar"], nav').first();
      if (await sidebar.isVisible().catch(() => false)) {
        await page.screenshot({ path: join(SS, 'switch-2-sidebar.png') });
        const links = await sidebar.locator('a, button, [role="button"]').all();
        for (const link of links.slice(0, 20)) {
          const text = await link.textContent().catch(() => '');
          if (text.includes('android') || text.includes('Android') || text.includes('문제풀이')) {
            console.log(`  사이드바 링크 발견: "${text.slice(0, 50)}"`);
            await link.click();
            await page.waitForTimeout(8000);
            break;
          }
        }
      }
    }
  }

  await page.screenshot({ path: join(SS, 'switch-3-after.png') });
  console.log(`  전환 후 URL: ${page.url()}`);
  console.log(`  새 facets 호출: ${facetCalls.length - beforeCount}개`);

  // 4. 새로 캡처된 Android facets 요청 출력
  if (facetCalls.length > beforeCount) {
    const latest = facetCalls[facetCalls.length - 1];
    console.log('\n[4] Android facets 요청 캡처됨!');
    console.log(`  URL: ${latest.url}`);
    writeFileSync(join(SS, 'android-facets-body.json'), latest.body || '{}');
    console.log('  Body 저장: screenshots/android-facets-body.json');
    try {
      const parsed = JSON.parse(latest.body);
      console.log('  keyword_view_id:', parsed.filters?.keyword_view_id);
      console.log('  os:', parsed.filters?.os);
      console.log('  devices:', parsed.filters?.devices);
      console.log('  query_identifier:', latest.url.split('query_identifier=')[1]);
    } catch {}
  } else {
    console.log('\n[4] 새 facets 요청 없음 — 전체 페이지 구조 덤프');
    // 페이지의 앱 관련 UI 구조 상세 덤프
    const dump = await page.evaluate(() => {
      const info = {};
      // 현재 선택된 앱 정보
      info.title = document.title;
      // 모든 select/dropdown 요소
      info.selects = Array.from(document.querySelectorAll('select')).map(s => ({
        name: s.name, options: Array.from(s.options).map(o => o.text).slice(0, 10),
      }));
      // data-testid 요소들
      info.testIds = Array.from(document.querySelectorAll('[data-testid]')).map(el => ({
        testId: el.getAttribute('data-testid'),
        text: el.textContent?.trim().slice(0, 40),
      })).slice(0, 20);
      return info;
    });
    console.log(JSON.stringify(dump, null, 2));
  }

  const state = await context.storageState();
  writeFileSync(AUTH, JSON.stringify(state));
  console.log('\n✅ 완료');
  await browser.close();
}

run();
