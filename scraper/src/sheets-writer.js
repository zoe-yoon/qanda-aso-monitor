/**
 * Google Sheets 적재 — Apps Script 웹앱으로 POST
 *
 * 서비스 계정 불필요. 스프레드시트에 바인딩된 Apps Script가 데이터를 받아 시트에 씀.
 */

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxm6ezzpJLMSMm5cLSbwawpbtJBZ53xS32bibL3xZ5jZ0Wnt0d-EveSbBzPGKXzCaZn/exec';

async function post(payload) {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  });
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    if (!json.ok) throw new Error(json.error || 'GAS 오류');
  } catch {
    if (!res.ok) throw new Error(`GAS HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
}

function extractKeywords(rankData) {
  return Object.entries(rankData)
    .filter(([name, d]) => name !== 'null' && d.rank != null)
    .sort((a, b) => a[1].rank - b[1].rank)
    .map(([name, d]) => ({
      name,
      rank: d.rank,
      change: d.change ?? 0,
      trafficScore: d.trafficScore ?? 0,
      searchVolume: d.searchVolume ?? 0,
    }));
}

export async function writeRankings(sheetName, date, rankData) {
  const keywords = extractKeywords(rankData);
  await post({ type: 'rankings', sheetName, date, keywords });
  console.log(`[Sheets] ${sheetName}: ${keywords.length}개 키워드 저장`);
}

export async function writeDownloads(sheetName, date, rankData) {
  const keywords = extractKeywords(rankData);
  await post({ type: 'downloads', sheetName, date, keywords });
  console.log(`[Sheets] ${sheetName}: ${keywords.length}개 검색량 저장`);
}

export async function writeCategoryRank(date, catData) {
  const today = catData.find(d => d.date === date);
  await post({
    type: 'category',
    date,
    iosIphone: today?.iosIphone ?? null,
    iosIpad: today?.iosIpad ?? null,
    android: today?.android ?? null,
  });
  console.log(`[Sheets] CategoryRank: iOS=${today?.iosIphone ?? '-'}, Android=${today?.android ?? '-'}`);
}

export async function writeSuggestions(date, iosRankings, androidRankings) {
  const PRIMARY = ['수학', '문제 풀이', '답지', '교육', '공부', '시험', '풀이'];
  const SECONDARY = ['ai 공부', '내신', '모의고사', '영단어', '기출', '공부 타이머', '과학'];
  const KNOWN = new Set([...PRIMARY, ...SECONDARY]);

  const BRAND_PATTERNS = [
    /^콴/, /^qanda/i, /^quanda/i, /^qunda/i, /^환다/, /^쾬다/, /^칸다/, /^콰다/,
    /^판다$/, /^칸타타$/, /^canada$/i,
  ];
  const CATEGORY_RULES = [
    { pattern: /수학|math/i, category: '수학/풀이' },
    { pattern: /문제|풀이|답|해설/i, category: '수학/풀이' },
    { pattern: /공부|학습|study/i, category: '교육/학습' },
    { pattern: /시험|내신|모의고사|기출/i, category: '시험/입시' },
    { pattern: /과외|과학|교육/i, category: '교육/학습' },
    { pattern: /영단어|영어|english/i, category: '어학' },
  ];

  function isBrand(name) { return BRAND_PATTERNS.some(p => p.test(name)); }
  function categorize(name) {
    for (const r of CATEGORY_RULES) { if (r.pattern.test(name)) return r.category; }
    return '기타';
  }

  function getSuggestions(rankData, os) {
    return Object.entries(rankData)
      .filter(([name, d]) => name !== 'null' && d.rank != null)
      .filter(([name]) => !KNOWN.has(name))
      .filter(([, d]) => (d.trafficScore ?? 0) >= 3.0)
      .filter(([name]) => !isBrand(name))
      .map(([name, d]) => {
        const change = -(d.change || 0);
        const reason = change > 0
          ? `순위 ${change}단계 상승 중, 트래픽 ${d.trafficScore}`
          : d.rank <= 10
            ? `Top 10 유지 중, 트래픽 ${d.trafficScore}`
            : `트래픽 ${d.trafficScore}, 검색량 ${(d.searchVolume ?? 0).toLocaleString()}`;
        return { os, name, trafficScore: d.trafficScore, rank: d.rank, category: categorize(name), reason };
      });
  }

  const suggestions = [
    ...getSuggestions(iosRankings, 'iOS'),
    ...getSuggestions(androidRankings, 'Android'),
  ];

  if (suggestions.length > 0) {
    await post({ type: 'suggestions', date, suggestions });
    console.log(`[Sheets] Suggestions: ${suggestions.length}개 제안 저장`);
  }
}

export async function writeDownloadSources(date, downloadSources) {
  for (const os of ['ios', 'android']) {
    const entries = downloadSources[os] || [];
    if (entries.length === 0) continue;
    await post({
      type: 'downloadSources',
      os,
      date,
      entries,
    });
    console.log(`[Sheets] DownloadSources_${os}: ${entries.length}일 데이터 저장`);
  }
}

export async function writeCollectionLog(status, durationSec, iosCount, androidCount, errors) {
  const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  await post({
    type: 'log',
    timestamp,
    status,
    duration: durationSec,
    iosCount,
    androidCount,
    errors: errors || '',
  });
  console.log(`[Sheets] CollectionLog: ${status}`);
}
