/**
 * Android 키워드 0개 원인 진단
 */
import { chromium } from 'playwright';
import { join } from 'path';
import { writeFileSync } from 'fs';

const AUTH = join(process.cwd(), 'auth-state', 'st-session.json');

async function diag() {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({ storageState: AUTH });
  const page = await context.newPage();

  let csrf = '';
  page.on('request', r => { const t = r.headers()['x-csrf-token']; if (t) csrf = t; });
  await page.goto('https://app.sensortower.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  if (!csrf) csrf = await page.evaluate(() => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '');

  const api = async (label, fn) => {
    console.log(`\n[${label}]`);
    try { const r = await fn(); console.log(JSON.stringify(r).slice(0, 500)); return r; }
    catch (e) { console.error('  에러:', e.message); return null; }
  };

  // 1. Android Korea 뷰 메타데이터 — 키워드 등록 여부 확인
  await api('Android KR 메타데이터', () => page.evaluate(async (csrf) => {
    const res = await fetch('/api/app_intel/user_apps/69a0059e04429989a8cf2159/metadata?country=KR', {
      headers: { 'X-CSRF-Token': csrf },
    });
    return res.json();
  }, csrf));

  // 2. Android Indonesia 뷰 메타데이터
  await api('Android ID 메타데이터', () => page.evaluate(async (csrf) => {
    const res = await fetch('/api/app_intel/user_apps/698445d12d94188f03a79a7c/metadata?country=KR', {
      headers: { 'X-CSRF-Token': csrf },
    });
    return res.json();
  }, csrf));

  // 3. 모든 뷰 목록 재확인
  await api('등록 앱 전체', () => page.evaluate(async (csrf) => {
    const res = await fetch('/api/app_intel/user_apps', { headers: { 'X-CSRF-Token': csrf } });
    const d = await res.json();
    return (d.user_apps || []).map(a => ({
      name: a.appName, os: a.os, appId: a.appId, viewId: a.id, country: a.country,
    }));
  }, csrf));

  // 4. Android KR — device 변형 테스트
  const body = (device, viewId) => ({
    breakdowns: [[], ['keyword']],
    facets: [
      { facet: 'keyword', alias: 'keyword' },
      { facet: 'keyword_rank', alias: 'keyword_rank' },
    ],
    filters: {
      keyword_view_id: viewId,
      start_date: '2025-12-19', end_date: '2026-03-18',
      comparison_start_date: '2025-09-20', comparison_end_date: '2025-12-18',
      regions: ['KR'], devices: [device], os: 'android',
      keywords: { in: {
        breakdowns: [['keyword']],
        facets: [{ facet: 'keyword', alias: 'keyword' }, { facet: 'keyword_rank', alias: 'keyword_rank' }],
        filters: {
          keyword_view_id: viewId,
          start_date: '2026-03-11', end_date: '2026-03-18',
          comparison_start_date: '2025-09-20', comparison_end_date: '2025-12-18',
          regions: ['KR'], devices: [device], os: 'android',
        },
        limit: 100, offset: 0, order_by: [{ keyword_rank: 'asc' }],
      }},
    },
    order_by: [{ keyword_rank: 'asc' }],
  });

  for (const [label, device, viewId] of [
    ['KR-android_mobile', 'android_mobile', '69a0059e04429989a8cf2159'],
    ['KR-android_phone', 'android_phone', '69a0059e04429989a8cf2159'],
    ['KR-phone', 'phone', '69a0059e04429989a8cf2159'],
    ['ID-android_mobile', 'android_mobile', '698445d12d94188f03a79a7c'],
  ]) {
    await api(`API ${label}`, () => page.evaluate(async ({ b, csrf, appId }) => {
      const res = await fetch(`/api/v2/apps/facets?query_identifier=aso_keywords_management_table_${appId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify(b),
      });
      const d = await res.json();
      return { status: res.status, count: d.data?.length || 0, first: d.data?.[0], error: d.error || d.message };
    }, { b: body(device, viewId), csrf, appId: 'com.mathpresso.qanda' }));
  }

  // 5. iOS viewId로 Android os 파라미터 — 혹시 viewId가 OS 무관인지 확인
  await api('iOS-viewId + android-os', () => page.evaluate(async ({ b, csrf }) => {
    const res = await fetch('/api/v2/apps/facets?query_identifier=aso_keywords_management_table_com.mathpresso.qanda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      body: JSON.stringify(b),
    });
    const d = await res.json();
    return { status: res.status, count: d.data?.length || 0, error: d.error || d.message };
  }, { b: body('android_mobile', '6980555e58005572eb4d657d'), csrf }));

  const state = await context.storageState();
  writeFileSync(AUTH, JSON.stringify(state));
  console.log('\n✅ 진단 완료');
  await browser.close();
}

diag();
