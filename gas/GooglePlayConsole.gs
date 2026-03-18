/**
 * Google Play Console — Android 다운로드 & CVR
 *
 * 방법:
 *   1. GPC → Cloud Storage export → GAS에서 읽기 (권장)
 *   2. Play Developer API v3 (제한적)
 *   3. Sensor Tower 추정치 사용
 *
 * 여기서는 방법 1 (GCS export)과 방법 3 (Sensor Tower fallback)을 구현합니다.
 */

/**
 * Google Cloud Storage에서 Play Console export 파일 읽기
 *
 * GPC 설정: 설정 > 보고서 > Cloud Storage로 내보내기
 * 버킷 경로: gs://YOUR_BUCKET/stats/installs/
 *
 * @returns {Object|null} { totalDownloads, date }
 */
function getAndroidDownloadsFromGCS() {
  var bucketName = PropertiesService.getScriptProperties().getProperty('GPC_GCS_BUCKET');
  if (!bucketName) {
    Logger.log('GPC_GCS_BUCKET 미설정, Sensor Tower fallback 사용');
    return null;
  }

  var yesterday = getAndroidYesterdayString_();
  var packageName = getRequiredProperty('QANDA_ANDROID_PACKAGE');

  // GPC export 파일명 패턴: installs_PACKAGE_YYYYMM_overview.csv
  var yearMonth = yesterday.substring(0, 7).replace('-', '');
  var fileName = 'stats/installs/installs_' + packageName + '_' + yearMonth + '_overview.csv';

  try {
    var url = 'https://storage.googleapis.com/storage/v1/b/'
      + encodeURIComponent(bucketName)
      + '/o/' + encodeURIComponent(fileName) + '?alt=media';

    var token = ScriptApp.getOAuthToken();
    var response = UrlFetchApp.fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token },
      muteHttpExceptions: true,
    });

    if (response.getResponseCode() !== 200) {
      Logger.log('GCS 파일 읽기 실패: ' + response.getResponseCode());
      return null;
    }

    var csvText = response.getContentText();
    var lines = csvText.split('\n');

    // yesterday 날짜의 행 찾기
    for (var i = 1; i < lines.length; i++) {
      var cols = lines[i].split(',');
      if (cols[0] === yesterday) {
        return {
          totalDownloads: parseInt(cols[1]) || 0,
          activeInstalls: parseInt(cols[2]) || 0,
          uninstalls: parseInt(cols[3]) || 0,
          date: yesterday,
        };
      }
    }

    Logger.log('GCS에서 ' + yesterday + ' 데이터 없음');
    return null;
  } catch (e) {
    Logger.log('GCS 접근 에러: ' + e.message);
    return null;
  }
}

/**
 * Android 키워드별 다운로드/CVR — Sensor Tower 추정치 사용
 *
 * @param {string} keyword
 * @returns {Object|null} { downloads, cvr }
 */
function getAndroidKeywordMetrics(keyword) {
  var packageName = getRequiredProperty('QANDA_ANDROID_PACKAGE');
  var data = stFetch_('/android/keyword_analysis', {
    app_id: packageName,
    keyword: keyword,
    country: 'KR',
  });

  if (!data) return null;

  return {
    downloads: data.estimated_downloads || 0,
    cvr: data.conversion_rate || 0,
  };
}

/**
 * Play Developer API — 전체 앱 통계 (대안)
 * OAuth2 필요, 직접 호출은 복잡하므로 GCS export 권장
 */
function getAndroidStatsFromApi_() {
  // Play Developer API v3는 리뷰/인앱구매 위주,
  // 다운로드 통계는 GCS export가 유일한 공식 방법
  Logger.log('Play Developer API는 다운로드 통계를 직접 제공하지 않습니다. GCS export를 사용하세요.');
  return null;
}

function getAndroidYesterdayString_() {
  var d = new Date();
  d.setDate(d.getDate() - 1);
  return Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd');
}
