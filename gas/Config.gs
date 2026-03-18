/**
 * ASO Keyword Monitor — Configuration
 *
 * ⚠️ API 키를 직접 입력하지 말고, Script Properties에 저장하세요.
 *    파일 > 프로젝트 설정 > 스크립트 속성
 *
 * 필요한 스크립트 속성:
 *   SENSOR_TOWER_API_KEY  — Sensor Tower API 토큰
 *   ASC_KEY_ID            — App Store Connect API Key ID
 *   ASC_ISSUER_ID         — App Store Connect Issuer ID
 *   ASC_PRIVATE_KEY       — App Store Connect Private Key (PEM, -----BEGIN... 포함)
 *   GPC_SERVICE_ACCOUNT   — Google Play Console 서비스 계정 JSON
 *   SLACK_WEBHOOK_URL     — Slack Incoming Webhook URL
 *   QANDA_IOS_APP_ID      — 콴다 iOS App ID (e.g., "1150247800")
 *   QANDA_ANDROID_PACKAGE — 콴다 Android 패키지명 (e.g., "com.mathpresso.qanda")
 */

// ─── 시트 이름 상수 ───
var SHEETS = {
  CONFIG: 'Config',
  IOS_RANKINGS: 'iOS_Rankings',
  ANDROID_RANKINGS: 'Android_Rankings',
  IOS_DOWNLOADS: 'iOS_Downloads',
  ANDROID_DOWNLOADS: 'Android_Downloads',
  CATEGORY_RANK: 'CategoryRank',
  COMPETITORS: 'Competitors',
  SUGGESTIONS: 'Suggestions',
  ALERT_LOG: 'AlertLog',
};

// ─── 경쟁사 앱 정보 ───
var COMPETITORS = {
  malhaeboca: {
    name: '말해보카',
    iosId: '1220155871',
    androidPackage: 'com.malhaeboca.app',
  },
  speak: {
    name: '스픽',
    iosId: '1286609883',
    androidPackage: 'com.speakeasyapp',
  },
  duolingo: {
    name: '듀오링고',
    iosId: '570060128',
    androidPackage: 'com.duolingo',
  },
  charlcak: {
    name: '찰칵',
    iosId: '1609537938',
    androidPackage: 'com.mathflat',
  },
};

// ─── 알림 설정 기본값 ───
var ALERT_DEFAULTS = {
  threshold: 3,          // ±N위 이상 변동 시 알림
  target: 'all',         // 'all' | 'primary' | 'secondary'
};

// ─── 유틸리티 ───

/**
 * Script Properties에서 값을 가져옵니다.
 * 없으면 에러를 throw합니다.
 */
function getRequiredProperty(key) {
  var val = PropertiesService.getScriptProperties().getProperty(key);
  if (!val) {
    throw new Error('Script Property "' + key + '" 가 설정되지 않았습니다. 프로젝트 설정 > 스크립트 속성에서 추가하세요.');
  }
  return val;
}

/**
 * Script Properties에서 값을 가져옵니다.
 * 없으면 fallback을 반환합니다.
 */
function getPropertyOrDefault(key, fallback) {
  var val = PropertiesService.getScriptProperties().getProperty(key);
  return val || fallback;
}

/**
 * Config 시트에서 모니터링 키워드 목록을 읽어옵니다.
 * 형식: | 키워드 | 분류(primary/secondary) |
 */
function getMonitoredKeywords() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.CONFIG);
  if (!sheet) {
    throw new Error('Config 시트가 없습니다. 먼저 setupSheets()를 실행하세요.');
  }

  var data = sheet.getRange('A2:B').getValues();
  var keywords = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i][0]) {
      keywords.push({
        name: String(data[i][0]).trim(),
        classification: String(data[i][1] || 'unclassified').trim(),
      });
    }
  }
  return keywords;
}

/**
 * Config 시트에서 알림 설정을 읽어옵니다.
 */
function getAlertSettings() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.CONFIG);
  if (!sheet) return ALERT_DEFAULTS;

  var threshold = sheet.getRange('D2').getValue();
  var target = sheet.getRange('E2').getValue();

  return {
    threshold: threshold || ALERT_DEFAULTS.threshold,
    target: target || ALERT_DEFAULTS.target,
  };
}
