/**
 * iTunes Search API — iOS 키워드 순위 (무료, 공식)
 * Sensor Tower 실패 시 fallback으로 사용
 */

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';

/**
 * iTunes Search API로 키워드 검색 → 콴다 앱 순위 추출
 */
export async function getIosKeywordRank(keyword, appId) {
  try {
    const params = new URLSearchParams({
      term: keyword,
      country: 'KR',
      entity: 'software',
      limit: '100',
    });

    const resp = await fetch(`${ITUNES_SEARCH_URL}?${params}`);
    if (!resp.ok) return null;

    const data = await resp.json();
    const results = data.results || [];

    // 콴다 앱의 순위 찾기
    const index = results.findIndex(
      (app) => String(app.trackId) === String(appId)
    );

    if (index === -1) return null;

    return {
      rank: index + 1,
      totalResults: results.length,
    };
  } catch (e) {
    console.error(`[iTunes] "${keyword}" 검색 실패:`, e.message);
    return null;
  }
}

/**
 * 여러 키워드의 iOS 랭킹 벌크 조회
 */
export async function getIosKeywordRanksBulk(keywords, appId) {
  const results = {};

  for (const kw of keywords) {
    // Rate limit: iTunes API는 ~20 req/min 권장
    await sleep(3000);

    const result = await getIosKeywordRank(kw, appId);
    results[kw] = result;
    console.log(`[iTunes] "${kw}" → ${result ? result.rank + '위' : '순위 없음'}`);
  }

  return results;
}

/**
 * 경쟁사 앱의 iOS 키워드 순위 조회
 */
export async function getIosCompetitorRanks(keyword, competitorIds) {
  try {
    const params = new URLSearchParams({
      term: keyword,
      country: 'KR',
      entity: 'software',
      limit: '200',
    });

    const resp = await fetch(`${ITUNES_SEARCH_URL}?${params}`);
    if (!resp.ok) return {};

    const data = await resp.json();
    const results = data.results || [];

    const ranks = {};
    for (const [key, appId] of Object.entries(competitorIds)) {
      const index = results.findIndex(
        (app) => String(app.trackId) === String(appId)
      );
      ranks[key] = index >= 0 ? index + 1 : null;
    }

    return ranks;
  } catch (e) {
    console.error(`[iTunes] 경쟁사 검색 실패:`, e.message);
    return {};
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
