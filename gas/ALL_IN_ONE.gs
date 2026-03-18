// ╔══════════════════════════════════════════════════════════════╗
// ║  ASO Keyword Monitor — All-in-One Google Apps Script        ║
// ║                                                              ║
// ║  설정 방법:                                                  ║
// ║  1. 이 파일 전체를 복사                                      ║
// ║  2. Google Sheets → 확장 프로그램 → Apps Script              ║
// ║  3. 기존 코드 전부 지우고 붙여넣기                           ║
// ║  4. 저장 (Ctrl+S)                                            ║
// ║  5. 함수 선택 드롭다운에서 "setupAll" 선택 → ▶ 실행          ║
// ║  6. 권한 승인 팝업 → 허용                                    ║
// ║                                                              ║
// ║  ⚠️ Sensor Tower API 키가 있으면:                            ║
// ║     파일 > 프로젝트 설정 > 스크립트 속성 에서 추가:          ║
// ║     SENSOR_TOWER_API_KEY = 토큰값                            ║
// ║     SLACK_WEBHOOK_URL = https://hooks.slack.com/...          ║
// ║                                                              ║
// ║  없으면 수동 입력 모드로 동작합니다.                         ║
// ╚══════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

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
  COLLECTION_LOG: 'CollectionLog',
};

var QANDA = {
  iosAppId: '1150247800',
  androidPackage: 'com.mathpresso.qanda',
};

var COMPETITORS_INFO = {
  malhaeboca: { name: '말해보카', iosId: '1220155871', androidPackage: 'com.malhaeboca.app' },
  speak:      { name: '스픽',     iosId: '1286609883', androidPackage: 'com.speakeasyapp' },
  duolingo:   { name: '듀오링고', iosId: '570060128',  androidPackage: 'com.duolingo' },
  charlcak:   { name: '찰칵',     iosId: '1609537938', androidPackage: 'com.mathflat' },
};

var DEFAULT_KEYWORDS = [
  ['수학', 'primary'],
  ['문제 풀이', 'primary'],
  ['답지', 'primary'],
  ['교육', 'primary'],
  ['공부', 'primary'],
  ['시험', 'primary'],
  ['풀이', 'primary'],
  ['ai 공부', 'secondary'],
  ['내신', 'secondary'],
  ['모의고사', 'secondary'],
  ['영단어', 'secondary'],
  ['기출', 'secondary'],
  ['공부 타이머', 'secondary'],
  ['과학', 'secondary'],
];

// ─────────────────────────────────────────────
// ★ 최초 1회 실행: 시트 생성 + 트리거 설정
// ─────────────────────────────────────────────

function setupAll() {
  setupSheets();
  setupDailyTrigger();
  setupWeeklyTrigger();

  SpreadsheetApp.getUi().alert(
    '✅ 설정 완료!\n\n'
    + '• 시트 9개 생성됨\n'
    + '• 기본 키워드 14개 입력됨\n'
    + '• 매일 오전 9시(KST) 자동 수집 트리거 설정됨\n'
    + '• 매주 월요일 오전 10시(KST) 주간 리포트 트리거 설정됨\n\n'
    + '다음 단계:\n'
    + '1. Config 시트에서 키워드 추가/수정\n'
    + '2. [선택] 프로젝트 설정 > 스크립트 속성에서 API 키 입력\n'
    + '   - SENSOR_TOWER_API_KEY\n'
    + '   - SLACK_WEBHOOK_URL\n\n'
    + 'API 키 없이도 수동 입력 모드로 사용 가능합니다.'
  );
}

// ─────────────────────────────────────────────
// SHEET SETUP
// ─────────────────────────────────────────────

function ensureSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#f3f4f6')
        .setFontColor('#374151');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── Config 시트 ──
  var configSheet = ensureSheet_(SHEETS.CONFIG, [
    '키워드', '분류(primary/secondary)', '', '설정항목', '설정값'
  ]);

  if (configSheet.getLastRow() <= 1) {
    // 키워드 입력
    configSheet.getRange(2, 1, DEFAULT_KEYWORDS.length, 2).setValues(DEFAULT_KEYWORDS);

    // 설정값
    configSheet.getRange('D2').setValue('알림_임계값');
    configSheet.getRange('E2').setValue(3);
    configSheet.getRange('D3').setValue('알림_대상');
    configSheet.getRange('E3').setValue('all');
    configSheet.getRange('D4').setValue('iOS_앱ID');
    configSheet.getRange('E4').setValue(QANDA.iosAppId);
    configSheet.getRange('D5').setValue('Android_패키지');
    configSheet.getRange('E5').setValue(QANDA.androidPackage);
    configSheet.getRange('D6').setValue('데이터소스');
    configSheet.getRange('E6').setValue('manual');  // manual | sensor-tower

    // 컬럼 너비
    configSheet.setColumnWidth(1, 140);
    configSheet.setColumnWidth(2, 180);
    configSheet.setColumnWidth(3, 30);
    configSheet.setColumnWidth(4, 140);
    configSheet.setColumnWidth(5, 250);

    // 분류 드롭다운
    var classRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['primary', 'secondary', 'unclassified'])
      .build();
    configSheet.getRange('B2:B100').setDataValidation(classRule);

    // 안내 텍스트
    configSheet.getRange('D8').setValue('📌 사용법');
    configSheet.getRange('D9').setValue('A열: 모니터링할 키워드');
    configSheet.getRange('D10').setValue('B열: primary(주력) / secondary(보조)');
    configSheet.getRange('D11').setValue('E6: manual(수동입력) / sensor-tower(API)');
    configSheet.getRange('D8:D11').setFontColor('#6b7280');
  }

  // ── iOS 랭킹 ──
  var iosRankSheet = ensureSheet_(SHEETS.IOS_RANKINGS, ['날짜']);
  var keywordNames = DEFAULT_KEYWORDS.map(function(k) { return k[0]; });
  if (iosRankSheet.getLastColumn() <= 1) {
    iosRankSheet.getRange(1, 2, 1, keywordNames.length).setValues([keywordNames]);
    iosRankSheet.getRange(1, 1, 1, keywordNames.length + 1)
      .setFontWeight('bold').setBackground('#f3f4f6');
    iosRankSheet.setFrozenRows(1);
    iosRankSheet.setFrozenColumns(1);
  }

  // ── Android 랭킹 ──
  var androidRankSheet = ensureSheet_(SHEETS.ANDROID_RANKINGS, ['날짜']);
  if (androidRankSheet.getLastColumn() <= 1) {
    androidRankSheet.getRange(1, 2, 1, keywordNames.length).setValues([keywordNames]);
    androidRankSheet.getRange(1, 1, 1, keywordNames.length + 1)
      .setFontWeight('bold').setBackground('#f3f4f6');
    androidRankSheet.setFrozenRows(1);
    androidRankSheet.setFrozenColumns(1);
  }

  // ── 다운로드/CVR ──
  ensureSheet_(SHEETS.IOS_DOWNLOADS, ['날짜', '키워드', '다운로드', 'CVR(%)', '트래픽점수']);
  ensureSheet_(SHEETS.ANDROID_DOWNLOADS, ['날짜', '키워드', '다운로드', 'CVR(%)', '트래픽점수']);

  // ── 카테고리 순위 ──
  ensureSheet_(SHEETS.CATEGORY_RANK, ['날짜', 'iOS_교육카테고리', 'Android_교육카테고리']);

  // ── 경쟁사 ──
  ensureSheet_(SHEETS.COMPETITORS, ['날짜', 'OS', '키워드', '콴다', '말해보카', '스픽', '듀오링고', '찰칵']);

  // ── 제안 키워드 ──
  ensureSheet_(SHEETS.SUGGESTIONS, ['날짜', 'OS', '키워드', '트래픽점수', '랭킹', '카테고리', '모니터링여부']);

  // ── 알림 로그 ──
  ensureSheet_(SHEETS.ALERT_LOG, ['날짜시간', '키워드', 'OS', '변동', '현재랭킹', '알림상태']);

  // ── 수집 로그 ──
  ensureSheet_(SHEETS.COLLECTION_LOG, ['날짜시간', '상태', '소요시간(초)', '수집건수', '에러']);

  Logger.log('시트 설정 완료');
}

// ─────────────────────────────────────────────
// TRIGGER SETUP
// ─────────────────────────────────────────────

function setupDailyTrigger() {
  deleteTrigger_('dailyCollect');

  // UTC 0시 = KST 9시
  ScriptApp.newTrigger('dailyCollect')
    .timeBased()
    .everyDays(1)
    .atHour(0)
    .create();

  Logger.log('일일 수집 트리거 설정: 매일 KST 09:00');
}

function setupWeeklyTrigger() {
  deleteTrigger_('weeklyReport');

  // UTC 1시 = KST 10시, 매주 월요일
  ScriptApp.newTrigger('weeklyReport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(1)
    .create();

  Logger.log('주간 리포트 트리거 설정: 매주 월요일 KST 10:00');
}

function deleteTrigger_(funcName) {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === funcName) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

// ─────────────────────────────────────────────
// ★ DAILY COLLECT (매일 KST 09:00)
// ─────────────────────────────────────────────

function dailyCollect() {
  var startTime = new Date();
  var today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
  var dataSource = getConfigValue_('데이터소스') || 'manual';

  Logger.log('=== 일일 수집 시작: ' + today + ' (소스: ' + dataSource + ') ===');

  var keywords = getMonitoredKeywords_();
  var keywordNames = keywords.map(function(k) { return k.name; });
  var errorMessages = [];
  var totalItems = 0;

  if (dataSource === 'sensor-tower') {
    // ── API 모드: Sensor Tower에서 자동 수집 ──
    totalItems = collectFromSensorTower_(today, keywords, keywordNames, errorMessages);
  } else {
    // ── 수동 모드: 랭킹 시트에 오늘 날짜 행 준비 ──
    totalItems = prepareManualEntry_(today, keywordNames);
  }

  // 수집 로그 기록
  var endTime = new Date();
  var durationSec = Math.round((endTime - startTime) / 1000);
  logCollection_(today, errorMessages.length === 0 ? '성공' : '부분실패', durationSec, totalItems, errorMessages.join('; '));

  // 변동 감지 & Slack 알림 (수동 모드에서도 전일 대비 체크)
  checkAndAlert_(today, keywords, keywordNames);

  Logger.log('=== 일일 수집 완료 (' + durationSec + '초, ' + totalItems + '건) ===');
}

// ─────────────────────────────────────────────
// 수동 입력 모드: 오늘 날짜 행 준비
// ─────────────────────────────────────────────

function prepareManualEntry_(today, keywordNames) {
  var count = 0;

  // iOS 랭킹 시트에 오늘 행 추가 (비어있으면)
  var iosSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.IOS_RANKINGS);
  if (iosSheet && !hasDateRow_(iosSheet, today)) {
    var row = [today];
    for (var i = 0; i < keywordNames.length; i++) row.push('');
    iosSheet.appendRow(row);
    count++;
  }

  // Android 랭킹
  var androidSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.ANDROID_RANKINGS);
  if (androidSheet && !hasDateRow_(androidSheet, today)) {
    var arow = [today];
    for (var j = 0; j < keywordNames.length; j++) arow.push('');
    androidSheet.appendRow(arow);
    count++;
  }

  // 카테고리 순위
  var catSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CATEGORY_RANK);
  if (catSheet && !hasDateRow_(catSheet, today)) {
    catSheet.appendRow([today, '', '']);
    count++;
  }

  Logger.log('수동 입력 모드: 오늘(' + today + ') 빈 행 ' + count + '개 추가됨. 직접 값을 입력하세요.');
  return count;
}

function hasDateRow_(sheet, date) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;
  var dates = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < dates.length; i++) {
    var d = dates[i][0];
    if (d instanceof Date) {
      d = Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd');
    }
    if (String(d) === date) return true;
  }
  return false;
}

// ─────────────────────────────────────────────
// API 모드: Sensor Tower 자동 수집
// ─────────────────────────────────────────────

function collectFromSensorTower_(today, keywords, keywordNames, errorMessages) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('SENSOR_TOWER_API_KEY');
  if (!apiKey) {
    errorMessages.push('SENSOR_TOWER_API_KEY 미설정');
    Logger.log('API 키 없음, 수동 모드로 전환');
    return prepareManualEntry_(today, keywordNames);
  }

  var totalItems = 0;

  // 1. iOS 랭킹
  try {
    var iosRanks = {};
    for (var i = 0; i < keywordNames.length; i++) {
      Utilities.sleep(500);
      var result = stFetch_('/ios/keyword_rankings', apiKey, {
        app_id: QANDA.iosAppId, keyword: keywordNames[i], country: 'KR'
      });
      iosRanks[keywordNames[i]] = result ? { rank: result.rank, trafficScore: result.traffic_score } : null;
    }
    writeRankingRow_(SHEETS.IOS_RANKINGS, today, iosRanks, keywordNames);
    totalItems += keywordNames.length;
    Logger.log('iOS 랭킹 수집 완료');
  } catch (e) {
    errorMessages.push('iOS 랭킹: ' + e.message);
  }

  // 2. Android 랭킹
  try {
    var androidRanks = {};
    for (var j = 0; j < keywordNames.length; j++) {
      Utilities.sleep(500);
      var aResult = stFetch_('/android/keyword_rankings', apiKey, {
        app_id: QANDA.androidPackage, keyword: keywordNames[j], country: 'KR'
      });
      androidRanks[keywordNames[j]] = aResult ? { rank: aResult.rank, trafficScore: aResult.traffic_score } : null;
    }
    writeRankingRow_(SHEETS.ANDROID_RANKINGS, today, androidRanks, keywordNames);
    totalItems += keywordNames.length;
    Logger.log('Android 랭킹 수집 완료');
  } catch (e) {
    errorMessages.push('Android 랭킹: ' + e.message);
  }

  // 3. 카테고리 순위
  try {
    var iosCat = stFetch_('/ios/category_rankings', apiKey, {
      app_id: QANDA.iosAppId, category: 'education', country: 'KR', chart_type: 'free'
    });
    var androidCat = stFetch_('/android/category_rankings', apiKey, {
      app_id: QANDA.androidPackage, category: 'education', country: 'KR', chart_type: 'free'
    });
    writeCategoryRankRow_(today, iosCat ? iosCat.rank : null, androidCat ? androidCat.rank : null);
    totalItems += 2;
  } catch (e) {
    errorMessages.push('카테고리: ' + e.message);
  }

  // 4. 경쟁사 (주력 키워드만)
  try {
    var primaryKws = keywords.filter(function(k) { return k.classification === 'primary'; });
    for (var p = 0; p < primaryKws.length; p++) {
      var pkw = primaryKws[p].name;
      for (var compKey in COMPETITORS_INFO) {
        Utilities.sleep(300);
        var comp = COMPETITORS_INFO[compKey];
        // iOS
        var iosComp = stFetch_('/ios/keyword_rankings', apiKey, {
          app_id: comp.iosId, keyword: pkw, country: 'KR'
        });
        // Android
        var androidComp = stFetch_('/android/keyword_rankings', apiKey, {
          app_id: comp.androidPackage, keyword: pkw, country: 'KR'
        });
      }
      totalItems += 2;
    }
    Logger.log('경쟁사 랭킹 수집 완료');
  } catch (e) {
    errorMessages.push('경쟁사: ' + e.message);
  }

  return totalItems;
}

// ─────────────────────────────────────────────
// SENSOR TOWER API
// ─────────────────────────────────────────────

function stFetch_(endpoint, apiKey, params) {
  params = params || {};
  params.auth_token = apiKey;

  var qs = Object.keys(params).map(function(k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
  }).join('&');

  var url = 'https://api.sensortower.com/v1' + endpoint + '?' + qs;

  try {
    var resp = UrlFetchApp.fetch(url, {
      method: 'get',
      muteHttpExceptions: true,
      headers: { 'Accept': 'application/json' },
    });

    if (resp.getResponseCode() !== 200) {
      Logger.log('ST API ' + resp.getResponseCode() + ': ' + endpoint);
      return null;
    }
    return JSON.parse(resp.getContentText());
  } catch (e) {
    Logger.log('ST API error: ' + e.message);
    return null;
  }
}

// ─────────────────────────────────────────────
// SHEET WRITE UTILITIES
// ─────────────────────────────────────────────

function writeRankingRow_(sheetName, date, rankData, keywordNames) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // 중복 체크
  if (hasDateRow_(sheet, date)) {
    // 기존 행 업데이트
    var lastRow = sheet.getLastRow();
    var dates = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < dates.length; i++) {
      var d = dates[i][0];
      if (d instanceof Date) d = Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd');
      if (String(d) === date) {
        var row = [date];
        for (var j = 1; j < headers.length; j++) {
          var kw = headers[j];
          var data = rankData[kw];
          row.push(data && data.rank ? data.rank : '');
        }
        sheet.getRange(i + 2, 1, 1, row.length).setValues([row]);
        return;
      }
    }
  }

  // 새 행 추가
  var newRow = [date];
  for (var k = 1; k < headers.length; k++) {
    var kwName = headers[k];
    var d2 = rankData[kwName];
    newRow.push(d2 && d2.rank ? d2.rank : '');
  }
  sheet.appendRow(newRow);
}

function writeCategoryRankRow_(date, iosRank, androidRank) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CATEGORY_RANK);
  if (!sheet) return;

  if (hasDateRow_(sheet, date)) {
    var lastRow = sheet.getLastRow();
    var dates = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < dates.length; i++) {
      var d = dates[i][0];
      if (d instanceof Date) d = Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd');
      if (String(d) === date) {
        sheet.getRange(i + 2, 1, 1, 3).setValues([[date, iosRank || '', androidRank || '']]);
        return;
      }
    }
  }
  sheet.appendRow([date, iosRank || '', androidRank || '']);
}

// ─────────────────────────────────────────────
// CHANGE DETECTION & SLACK ALERT
// ─────────────────────────────────────────────

function checkAndAlert_(today, keywords, keywordNames) {
  var threshold = parseInt(getConfigValue_('알림_임계값')) || 3;
  var target = getConfigValue_('알림_대상') || 'all';
  var allChanges = [];

  // iOS 변동 체크
  var iosChanges = detectChanges_(SHEETS.IOS_RANKINGS, today, keywordNames, 'ios', keywords, threshold, target);
  allChanges = allChanges.concat(iosChanges);

  // Android 변동 체크
  var androidChanges = detectChanges_(SHEETS.ANDROID_RANKINGS, today, keywordNames, 'android', keywords, threshold, target);
  allChanges = allChanges.concat(androidChanges);

  if (allChanges.length > 0) {
    Logger.log('변동 감지: ' + allChanges.length + '건');
    sendSlackAlert_(allChanges);
  } else {
    Logger.log('임계값 이상 변동 없음');
  }
}

function detectChanges_(sheetName, today, keywordNames, os, keywords, threshold, target) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 3) return [];

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var lastRow = sheet.getLastRow();

  // 오늘 행과 전일 행
  var todayRow = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  var prevRow = sheet.getRange(lastRow - 1, 1, 1, sheet.getLastColumn()).getValues()[0];

  var changes = [];
  for (var i = 0; i < keywordNames.length; i++) {
    var kw = keywordNames[i];
    var colIdx = headers.indexOf(kw);
    if (colIdx === -1) continue;

    var currentRank = todayRow[colIdx];
    var previousRank = prevRow[colIdx];
    if (!currentRank || !previousRank) continue;

    currentRank = parseInt(currentRank);
    previousRank = parseInt(previousRank);
    if (isNaN(currentRank) || isNaN(previousRank)) continue;

    var change = previousRank - currentRank; // 양수 = 상승

    // 대상 필터
    if (target !== 'all') {
      var cls = 'unclassified';
      for (var k = 0; k < keywords.length; k++) {
        if (keywords[k].name === kw) { cls = keywords[k].classification; break; }
      }
      if (cls !== target) continue;
    }

    if (Math.abs(change) >= threshold) {
      changes.push({
        keyword: kw,
        os: os,
        previousRank: previousRank,
        currentRank: currentRank,
        change: change,
      });
    }
  }
  return changes;
}

// ─────────────────────────────────────────────
// SLACK NOTIFIER
// ─────────────────────────────────────────────

function sendSlackAlert_(changes) {
  var webhookUrl = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');
  if (!webhookUrl) {
    Logger.log('SLACK_WEBHOOK_URL 미설정, 알림 건너뜀');
    logAlerts_(changes, '미발송(URL없음)');
    return;
  }

  var now = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm');

  var blocks = [
    { type: 'header', text: { type: 'plain_text', text: '🔔 ASO 키워드 랭킹 변동 알림' } },
    { type: 'context', elements: [{ type: 'mrkdwn', text: now + ' KST' }] },
    { type: 'divider' },
  ];

  for (var i = 0; i < changes.length; i++) {
    var c = changes[i];
    var emoji = c.change > 0 ? '🔺' : '🔻';
    var changeText = c.change > 0 ? '+' + c.change : String(c.change);
    var osLabel = c.os === 'ios' ? 'iOS' : 'Android';

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: emoji + ' *' + c.keyword + '* (' + osLabel + ')\n'
          + '`' + c.previousRank + '위 → ' + c.currentRank + '위` (' + changeText + '위)',
      },
    });
  }

  blocks.push({ type: 'divider' });
  blocks.push({
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: '총 ' + changes.length + '건 | <' + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '|시트 열기>',
    }],
  });

  try {
    UrlFetchApp.fetch(webhookUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ blocks: blocks }),
      muteHttpExceptions: true,
    });
    logAlerts_(changes, '발송완료');
  } catch (e) {
    Logger.log('Slack 발송 실패: ' + e.message);
    logAlerts_(changes, '발송실패');
  }
}

function logAlerts_(changes, status) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.ALERT_LOG);
  if (!sheet) return;
  var now = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
  for (var i = 0; i < changes.length; i++) {
    var c = changes[i];
    sheet.appendRow([now, c.keyword, c.os, c.change, c.currentRank, status]);
  }
}

// ─────────────────────────────────────────────
// WEEKLY REPORT
// ─────────────────────────────────────────────

function weeklyReport() {
  Logger.log('=== 주간 리포트 생성 ===');

  var keywords = getMonitoredKeywords_();
  var keywordNames = keywords.map(function(k) { return k.name; });

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.IOS_RANKINGS);
  if (!sheet || sheet.getLastRow() < 3) {
    Logger.log('데이터 부족, 리포트 생략');
    return;
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var lastRow = sheet.getLastRow();
  var startRow = Math.max(2, lastRow - 6);
  var weekData = sheet.getRange(startRow, 1, lastRow - startRow + 1, sheet.getLastColumn()).getValues();

  var weekChanges = [];
  for (var i = 0; i < keywordNames.length; i++) {
    var kw = keywordNames[i];
    var colIdx = headers.indexOf(kw);
    if (colIdx === -1) continue;

    var firstRank = parseInt(weekData[0][colIdx]);
    var lastRank = parseInt(weekData[weekData.length - 1][colIdx]);
    if (isNaN(firstRank) || isNaN(lastRank)) continue;

    weekChanges.push({ keyword: kw, change: firstRank - lastRank, currentRank: lastRank });
  }

  weekChanges.sort(function(a, b) { return b.change - a.change; });

  var topRisers = weekChanges.filter(function(c) { return c.change > 0; }).slice(0, 3);
  var topFallers = weekChanges.filter(function(c) { return c.change < 0; }).slice(0, 3);

  var avgRank = weekChanges.length > 0
    ? Math.round(weekChanges.reduce(function(s, c) { return s + c.currentRank; }, 0) / weekChanges.length * 10) / 10
    : 0;

  var endDate = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
  var startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  var startDateStr = Utilities.formatDate(startDate, 'Asia/Seoul', 'yyyy-MM-dd');

  sendWeeklySlackReport_({
    period: startDateStr + ' ~ ' + endDate,
    avgRank: avgRank,
    topRisers: topRisers,
    topFallers: topFallers,
  });
}

function sendWeeklySlackReport_(summary) {
  var webhookUrl = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');
  if (!webhookUrl) { Logger.log('SLACK_WEBHOOK_URL 미설정'); return; }

  var risersText = summary.topRisers.map(function(r) {
    return '🔺 ' + r.keyword + ' (+' + r.change + ')';
  }).join('\n') || '없음';

  var fallersText = summary.topFallers.map(function(f) {
    return '🔻 ' + f.keyword + ' (' + f.change + ')';
  }).join('\n') || '없음';

  var payload = {
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: '📊 ASO 주간 리포트 (' + summary.period + ')' } },
      { type: 'divider' },
      { type: 'section', fields: [
        { type: 'mrkdwn', text: '*평균 랭킹*\n' + summary.avgRank + '위' },
      ]},
      { type: 'divider' },
      { type: 'section', text: { type: 'mrkdwn', text: '*주간 상승 Top 3*\n' + risersText } },
      { type: 'section', text: { type: 'mrkdwn', text: '*주간 하락 Top 3*\n' + fallersText } },
      { type: 'context', elements: [
        { type: 'mrkdwn', text: '<' + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '|전체 리포트 보기>' },
      ]},
    ],
  };

  UrlFetchApp.fetch(webhookUrl, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  Logger.log('주간 리포트 발송 완료');
}

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────

function getMonitoredKeywords_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CONFIG);
  if (!sheet) return [];

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

function getConfigValue_(label) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CONFIG);
  if (!sheet) return null;
  var data = sheet.getRange('D2:E20').getValues();
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim() === label) {
      return String(data[i][1]).trim();
    }
  }
  return null;
}

function logCollection_(date, status, durationSec, count, errors) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.COLLECTION_LOG);
  if (!sheet) return;
  var now = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
  sheet.appendRow([now, status, durationSec, count, errors || '']);
}

// ─────────────────────────────────────────────
// ★ 커스텀 메뉴 (시트 열 때 자동 추가)
// ─────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🔍 ASO Monitor')
    .addItem('▶ 지금 수집 실행', 'dailyCollect')
    .addItem('📊 주간 리포트 생성', 'weeklyReport')
    .addSeparator()
    .addItem('⚙️ 시트 초기화', 'setupSheets')
    .addItem('🔔 Slack 알림 테스트', 'testSlackAlert')
    .addToUi();
}

// ─────────────────────────────────────────────
// 테스트 함수들
// ─────────────────────────────────────────────

function testSlackAlert() {
  sendSlackAlert_([
    { keyword: '수학', os: 'ios', previousRank: 5, currentRank: 2, change: 3 },
    { keyword: '교육', os: 'android', previousRank: 10, currentRank: 15, change: -5 },
  ]);
  SpreadsheetApp.getUi().alert('Slack 테스트 알림이 발송되었습니다.\nSLACK_WEBHOOK_URL이 설정되어 있는지 확인하세요.');
}

function manualCollect() {
  dailyCollect();
}
