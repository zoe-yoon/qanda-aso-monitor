/**
 * App Store Connect API — iOS 다운로드 & CVR
 *
 * 인증: JWT (ES256) — Key ID, Issuer ID, Private Key 필요
 * 문서: https://developer.apple.com/documentation/appstoreconnectapi
 *
 * ⚠️ GAS에서 ES256 JWT 생성이 제한적이므로,
 *    외부 서비스(Cloud Functions 등)에서 토큰 생성 후 전달하거나,
 *    Apps Script의 Utilities로 우회 구현합니다.
 */

/**
 * ASC JWT 토큰 생성
 * GAS에서 ES256 직접 서명이 안 되므로, 대안:
 *   1. Script Property에 미리 생성한 JWT를 넣거나
 *   2. Cloud Functions endpoint를 호출하여 JWT를 받거나
 *   3. ASC에서 다운로드한 Sales Report를 수동 업로드
 *
 * 여기서는 방법 1 (사전 생성 JWT) 또는 방법 2를 가정합니다.
 */
function getAscToken_() {
  // 방법 1: 미리 생성한 토큰 (20분 유효)
  var pregenerated = PropertiesService.getScriptProperties().getProperty('ASC_JWT_TOKEN');
  if (pregenerated) return pregenerated;

  // 방법 2: Cloud Functions endpoint
  var tokenEndpoint = PropertiesService.getScriptProperties().getProperty('ASC_TOKEN_ENDPOINT');
  if (tokenEndpoint) {
    var resp = UrlFetchApp.fetch(tokenEndpoint, { muteHttpExceptions: true });
    if (resp.getResponseCode() === 200) {
      var json = JSON.parse(resp.getContentText());
      return json.token;
    }
  }

  throw new Error('ASC JWT 토큰을 가져올 수 없습니다. ASC_JWT_TOKEN 또는 ASC_TOKEN_ENDPOINT를 설정하세요.');
}

/**
 * ASC API 공통 요청
 */
function ascFetch_(path) {
  var token = getAscToken_();
  var url = 'https://api.appstoreconnect.apple.com' + path;

  var response = UrlFetchApp.fetch(url, {
    method: 'get',
    muteHttpExceptions: true,
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/json',
    },
  });

  var code = response.getResponseCode();
  if (code !== 200) {
    Logger.log('ASC API error: ' + code + ' — ' + response.getContentText().substring(0, 500));
    return null;
  }

  return JSON.parse(response.getContentText());
}

/**
 * iOS 앱 다운로드 수 조회 (Analytics Reports API)
 * 전일 기준 다운로드 수를 가져옵니다.
 *
 * @returns {Object|null} { totalDownloads, date }
 */
function getIosDownloads() {
  var appId = getRequiredProperty('QANDA_IOS_APP_ID');
  var yesterday = getYesterdayString_();

  // Analytics Reports — App Downloads
  var path = '/v1/apps/' + appId + '/analyticsReportRequests';

  // 먼저 리포트 요청 생성
  // (실제로는 이미 자동 생성된 일일 리포트를 가져오는 방식)
  var reportsPath = '/v1/apps/' + appId + '/analyticsReportInstances'
    + '?filter[processingDate]=' + yesterday
    + '&filter[granularity]=DAILY';

  var data = ascFetch_(reportsPath);
  if (!data || !data.data || data.data.length === 0) {
    Logger.log('iOS 다운로드 데이터 없음: ' + yesterday);
    return null;
  }

  // 리포트 인스턴스에서 다운로드 URL 추출 후 파싱
  var instance = data.data[0];
  var downloadUrl = instance.attributes.downloadUrl;

  if (!downloadUrl) {
    Logger.log('iOS 다운로드 URL 없음');
    return null;
  }

  var csvResp = UrlFetchApp.fetch(downloadUrl, { muteHttpExceptions: true });
  var csvText = csvResp.getContentText();

  // CSV 파싱하여 총 다운로드 수 추출
  var lines = csvText.split('\n');
  var totalDownloads = 0;
  for (var i = 1; i < lines.length; i++) {
    var cols = lines[i].split(',');
    if (cols.length > 1) {
      totalDownloads += parseInt(cols[1]) || 0;
    }
  }

  return {
    totalDownloads: totalDownloads,
    date: yesterday,
  };
}

/**
 * iOS 키워드별 다운로드/CVR 추정
 * ASC는 키워드별 다운로드를 직접 제공하지 않으므로,
 * Search Ads 데이터 또는 Sensor Tower 추정치를 사용합니다.
 *
 * @param {string} keyword
 * @returns {Object|null} { downloads, cvr }
 */
function getIosKeywordMetrics(keyword) {
  // Sensor Tower의 키워드별 추정 다운로드 사용
  var appId = getRequiredProperty('QANDA_IOS_APP_ID');
  var data = stFetch_('/ios/keyword_analysis', {
    app_id: appId,
    keyword: keyword,
    country: 'KR',
  });

  if (!data) return null;

  return {
    downloads: data.estimated_downloads || 0,
    cvr: data.conversion_rate || 0,
  };
}

// ─── 유틸리티 ───

function getYesterdayString_() {
  var d = new Date();
  d.setDate(d.getDate() - 1);
  return Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd');
}
