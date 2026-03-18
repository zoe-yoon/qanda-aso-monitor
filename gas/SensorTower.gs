/**
 * Sensor Tower API 호출
 *
 * 엔드포인트 문서: https://docs.sensortower.com/
 * Rate limit: Free tier 없음, Enterprise 계약 필요
 *
 * ⚠️ Sensor Tower API가 없는 경우:
 *    1. App Store / Google Play 검색 결과를 직접 스크래핑 (비추천, ToS 위반 가능)
 *    2. 수동 입력 모드로 전환 (Config 시트에서 직접 입력)
 *    3. 대안 API: AppFollow, data.ai, AppTweak 등
 */

var ST_BASE_URL = 'https://api.sensortower.com/v1';

/**
 * Sensor Tower API 공통 요청
 */
function stFetch_(endpoint, params) {
  var apiKey = getRequiredProperty('SENSOR_TOWER_API_KEY');
  params = params || {};
  params.auth_token = apiKey;

  var queryString = Object.keys(params).map(function(k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
  }).join('&');

  var url = ST_BASE_URL + endpoint + '?' + queryString;

  var options = {
    method: 'get',
    muteHttpExceptions: true,
    headers: { 'Accept': 'application/json' },
  };

  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();

  if (code !== 200) {
    Logger.log('Sensor Tower API error: ' + code + ' — ' + response.getContentText());
    return null;
  }

  return JSON.parse(response.getContentText());
}

/**
 * iOS 키워드 랭킹 조회
 * @param {string} keyword - 검색 키워드
 * @param {string} appId - 앱 ID
 * @param {string} country - 국가 코드 (KR)
 * @returns {Object|null} { rank, trafficScore }
 */
function getIosKeywordRank(keyword, appId, country) {
  var data = stFetch_('/ios/keyword_rankings', {
    app_id: appId,
    keyword: keyword,
    country: country || 'KR',
  });

  if (!data) return null;

  return {
    rank: data.rank || null,
    trafficScore: data.traffic_score || null,
  };
}

/**
 * Android 키워드 랭킹 조회
 */
function getAndroidKeywordRank(keyword, packageName, country) {
  var data = stFetch_('/android/keyword_rankings', {
    app_id: packageName,
    keyword: keyword,
    country: country || 'KR',
  });

  if (!data) return null;

  return {
    rank: data.rank || null,
    trafficScore: data.traffic_score || null,
  };
}

/**
 * iOS 키워드 랭킹 벌크 조회 (여러 키워드 한번에)
 */
function getIosKeywordRanksBulk(keywords, appId, country) {
  var results = {};
  for (var i = 0; i < keywords.length; i++) {
    var kw = keywords[i];
    Utilities.sleep(500); // Rate limit 방지
    var result = getIosKeywordRank(kw, appId, country);
    results[kw] = result;
  }
  return results;
}

/**
 * Android 키워드 랭킹 벌크 조회
 */
function getAndroidKeywordRanksBulk(keywords, packageName, country) {
  var results = {};
  for (var i = 0; i < keywords.length; i++) {
    var kw = keywords[i];
    Utilities.sleep(500);
    var result = getAndroidKeywordRank(kw, packageName, country);
    results[kw] = result;
  }
  return results;
}

/**
 * 경쟁사 키워드 랭킹 조회
 * @param {string} keyword
 * @param {string} os - 'ios' | 'android'
 * @returns {Object} { malhaeboca: rank, speak: rank, ... }
 */
function getCompetitorRanks(keyword, os) {
  var competitorRanks = {};
  var competitors = COMPETITORS;

  for (var key in competitors) {
    Utilities.sleep(300);
    var comp = competitors[key];
    var result;
    if (os === 'ios') {
      result = getIosKeywordRank(keyword, comp.iosId, 'KR');
    } else {
      result = getAndroidKeywordRank(keyword, comp.androidPackage, 'KR');
    }
    competitorRanks[key] = result ? result.rank : null;
  }

  return competitorRanks;
}

/**
 * 교육 카테고리 내 앱 랭킹 조회
 * @param {string} os - 'ios' | 'android'
 * @param {string} appId - 앱 ID 또는 패키지명
 * @returns {number|null} 카테고리 내 순위
 */
function getCategoryRank(os, appId) {
  var endpoint = os === 'ios'
    ? '/ios/category_rankings'
    : '/android/category_rankings';

  var data = stFetch_(endpoint, {
    app_id: appId,
    category: 'education', // 교육 카테고리
    country: 'KR',
    chart_type: 'free',
  });

  if (!data) return null;
  return data.rank || null;
}

/**
 * 키워드 제안 — 트래픽 점수가 높은 관련 키워드 발견
 * @param {string} seedKeyword - 시드 키워드
 * @param {string} os - 'ios' | 'android'
 * @returns {Array} [{ keyword, trafficScore, rank }]
 */
function getSuggestedKeywords(seedKeyword, os) {
  var endpoint = os === 'ios'
    ? '/ios/keyword_suggestions'
    : '/android/keyword_suggestions';

  var appId = os === 'ios'
    ? getRequiredProperty('QANDA_IOS_APP_ID')
    : getRequiredProperty('QANDA_ANDROID_PACKAGE');

  var data = stFetch_(endpoint, {
    app_id: appId,
    keyword: seedKeyword,
    country: 'KR',
    limit: 20,
  });

  if (!data || !data.suggestions) return [];

  return data.suggestions.map(function(s) {
    return {
      keyword: s.keyword,
      trafficScore: s.traffic_score,
      rank: s.rank || null,
    };
  });
}
