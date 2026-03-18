/**
 * ASO Keyword Monitor — 메인 실행 스크립트
 *
 * 매일 오전 9시(KST)에 자동 실행됩니다.
 * 최초 1회 setupDailyTrigger()를 수동 실행하세요.
 */

/**
 * ★ 매일 오전 9시(KST) 트리거 설정
 * 이 함수를 1회 수동 실행하면 이후 매일 자동 실행됩니다.
 */
function setupDailyTrigger() {
  // 기존 트리거 삭제
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'dailyCollect') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // 매일 오전 9시(KST = UTC+9, 즉 UTC 0시)에 실행
  ScriptApp.newTrigger('dailyCollect')
    .timeBased()
    .everyDays(1)
    .atHour(0)  // UTC 0시 = KST 9시
    .create();

  Logger.log('트리거 설정 완료: 매일 KST 09:00에 dailyCollect 실행');
  SpreadsheetApp.getUi().alert('✅ 매일 오전 9시(KST) 자동 수집이 설정되었습니다.');
}

/**
 * ★ 주간 리포트 트리거 설정 (매주 월요일 오전 10시 KST)
 */
function setupWeeklyTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'weeklyReport') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('weeklyReport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(1)  // UTC 1시 = KST 10시
    .create();

  Logger.log('주간 리포트 트리거 설정 완료: 매주 월요일 KST 10:00');
}

/**
 * ★ 메인: 매일 실행되는 데이터 수집 함수
 */
function dailyCollect() {
  var startTime = new Date();
  Logger.log('=== 일일 데이터 수집 시작: ' + startTime.toLocaleString() + ' ===');

  var today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
  var keywords = getMonitoredKeywords();
  var keywordNames = keywords.map(function(k) { return k.name; });

  var iosAppId = getRequiredProperty('QANDA_IOS_APP_ID');
  var androidPackage = getRequiredProperty('QANDA_ANDROID_PACKAGE');

  var allChanges = []; // 알림 대상 변동 목록

  // ─── 1. iOS 키워드 랭킹 수집 ───
  Logger.log('1/6 iOS 키워드 랭킹 수집...');
  try {
    var iosRanks = getIosKeywordRanksBulk(keywordNames, iosAppId, 'KR');
    writeRankingRow(SHEETS.IOS_RANKINGS, today, iosRanks, keywordNames);

    // 전일 비교하여 변동 감지
    var iosChanges = detectChanges_(SHEETS.IOS_RANKINGS, today, iosRanks, keywordNames, 'ios', keywords);
    allChanges = allChanges.concat(iosChanges);
    Logger.log('  iOS 랭킹 완료: ' + Object.keys(iosRanks).length + '개');
  } catch (e) {
    Logger.log('  iOS 랭킹 에러: ' + e.message);
  }

  // ─── 2. Android 키워드 랭킹 수집 ───
  Logger.log('2/6 Android 키워드 랭킹 수집...');
  try {
    var androidRanks = getAndroidKeywordRanksBulk(keywordNames, androidPackage, 'KR');
    writeRankingRow(SHEETS.ANDROID_RANKINGS, today, androidRanks, keywordNames);

    var androidChanges = detectChanges_(SHEETS.ANDROID_RANKINGS, today, androidRanks, keywordNames, 'android', keywords);
    allChanges = allChanges.concat(androidChanges);
    Logger.log('  Android 랭킹 완료: ' + Object.keys(androidRanks).length + '개');
  } catch (e) {
    Logger.log('  Android 랭킹 에러: ' + e.message);
  }

  // ─── 3. iOS 다운로드/CVR 수집 ───
  Logger.log('3/6 iOS 다운로드/CVR 수집...');
  try {
    var iosDownloadRows = [];
    for (var i = 0; i < keywordNames.length; i++) {
      Utilities.sleep(500);
      var metrics = getIosKeywordMetrics(keywordNames[i]);
      iosDownloadRows.push({
        keyword: keywordNames[i],
        downloads: metrics ? metrics.downloads : 0,
        cvr: metrics ? metrics.cvr : 0,
        trafficScore: iosRanks && iosRanks[keywordNames[i]] ? iosRanks[keywordNames[i]].trafficScore : 0,
      });
    }
    writeDownloadRows(SHEETS.IOS_DOWNLOADS, today, iosDownloadRows);
    Logger.log('  iOS 다운로드 완료');
  } catch (e) {
    Logger.log('  iOS 다운로드 에러: ' + e.message);
  }

  // ─── 4. Android 다운로드/CVR 수집 ───
  Logger.log('4/6 Android 다운로드/CVR 수집...');
  try {
    var androidDownloadRows = [];
    for (var j = 0; j < keywordNames.length; j++) {
      Utilities.sleep(500);
      var aMetrics = getAndroidKeywordMetrics(keywordNames[j]);
      androidDownloadRows.push({
        keyword: keywordNames[j],
        downloads: aMetrics ? aMetrics.downloads : 0,
        cvr: aMetrics ? aMetrics.cvr : 0,
        trafficScore: androidRanks && androidRanks[keywordNames[j]] ? androidRanks[keywordNames[j]].trafficScore : 0,
      });
    }
    writeDownloadRows(SHEETS.ANDROID_DOWNLOADS, today, androidDownloadRows);
    Logger.log('  Android 다운로드 완료');
  } catch (e) {
    Logger.log('  Android 다운로드 에러: ' + e.message);
  }

  // ─── 5. 교육 카테고리 순위 수집 ───
  Logger.log('5/6 교육 카테고리 순위 수집...');
  try {
    var iosCatRank = getCategoryRank('ios', iosAppId);
    var androidCatRank = getCategoryRank('android', androidPackage);
    writeCategoryRankRow(today, iosCatRank, androidCatRank);
    Logger.log('  카테고리 순위: iOS=' + iosCatRank + ', Android=' + androidCatRank);
  } catch (e) {
    Logger.log('  카테고리 순위 에러: ' + e.message);
  }

  // ─── 6. 경쟁사 랭킹 수집 (주력 키워드만) ───
  Logger.log('6/6 경쟁사 랭킹 수집...');
  try {
    var primaryKeywords = keywords.filter(function(k) { return k.classification === 'primary'; });
    for (var p = 0; p < primaryKeywords.length; p++) {
      var pkw = primaryKeywords[p].name;

      // iOS 경쟁사
      var iosCompRanks = getCompetitorRanks(pkw, 'ios');
      var iosQandaRank = iosRanks && iosRanks[pkw] ? iosRanks[pkw].rank : null;
      writeCompetitorRow(today, 'ios', pkw, iosQandaRank, iosCompRanks);

      // Android 경쟁사
      var androidCompRanks = getCompetitorRanks(pkw, 'android');
      var androidQandaRank = androidRanks && androidRanks[pkw] ? androidRanks[pkw].rank : null;
      writeCompetitorRow(today, 'android', pkw, androidQandaRank, androidCompRanks);

      Utilities.sleep(300);
    }
    Logger.log('  경쟁사 랭킹 완료: ' + primaryKeywords.length + '개 키워드');
  } catch (e) {
    Logger.log('  경쟁사 랭킹 에러: ' + e.message);
  }

  // ─── 7. Slack 알림 발송 ───
  if (allChanges.length > 0) {
    Logger.log('Slack 알림 발송: ' + allChanges.length + '건');
    sendSlackAlert(allChanges);
  } else {
    Logger.log('변동 알림 없음');
  }

  var endTime = new Date();
  var durationSec = Math.round((endTime - startTime) / 1000);
  Logger.log('=== 일일 수집 완료 (' + durationSec + '초) ===');
}

/**
 * 전일 대비 변동을 감지합니다.
 */
function detectChanges_(sheetName, today, currentRanks, keywordNames, os, keywords) {
  var settings = getAlertSettings();
  var threshold = settings.threshold;
  var target = settings.target;

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 3) return []; // 최소 2일 데이터 필요

  // 전일 데이터 읽기 (마지막에서 2번째 행)
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var prevRowIdx = sheet.getLastRow() - 1; // 오늘 데이터가 이미 쓰여있으므로 그 전
  if (prevRowIdx < 2) return [];

  var prevRow = sheet.getRange(prevRowIdx, 1, 1, sheet.getLastColumn()).getValues()[0];

  var changes = [];
  for (var i = 0; i < keywordNames.length; i++) {
    var kw = keywordNames[i];
    var currentRank = currentRanks[kw] ? currentRanks[kw].rank : null;
    if (!currentRank) continue;

    // 해당 키워드의 열 인덱스 찾기
    var colIdx = headers.indexOf(kw);
    if (colIdx === -1) continue;

    var previousRank = prevRow[colIdx];
    if (!previousRank) continue;

    var change = previousRank - currentRank; // 양수 = 상승

    // 알림 대상 필터
    var kwClassification = 'unclassified';
    for (var k = 0; k < keywords.length; k++) {
      if (keywords[k].name === kw) {
        kwClassification = keywords[k].classification;
        break;
      }
    }

    if (target !== 'all' && kwClassification !== target) continue;

    // 임계값 체크
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

/**
 * 주간 리포트 생성 및 Slack 발송
 */
function weeklyReport() {
  Logger.log('=== 주간 리포트 생성 ===');

  var keywords = getMonitoredKeywords();
  var keywordNames = keywords.map(function(k) { return k.name; });

  // 최근 7일 랭킹 데이터 분석 (iOS 기준)
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.IOS_RANKINGS);
  if (!sheet || sheet.getLastRow() < 8) {
    Logger.log('주간 리포트: 데이터 부족 (최소 7일 필요)');
    return;
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var lastRow = sheet.getLastRow();
  var startRow = Math.max(2, lastRow - 6);
  var weekData = sheet.getRange(startRow, 1, lastRow - startRow + 1, sheet.getLastColumn()).getValues();

  // 키워드별 주간 변동 계산
  var weekChanges = [];
  for (var i = 0; i < keywordNames.length; i++) {
    var kw = keywordNames[i];
    var colIdx = headers.indexOf(kw);
    if (colIdx === -1) continue;

    var firstRank = weekData[0][colIdx];
    var lastRank = weekData[weekData.length - 1][colIdx];
    if (!firstRank || !lastRank) continue;

    weekChanges.push({
      keyword: kw,
      change: firstRank - lastRank, // 양수 = 상승
      currentRank: lastRank,
    });
  }

  weekChanges.sort(function(a, b) { return b.change - a.change; });

  var topRisers = weekChanges.filter(function(c) { return c.change > 0; }).slice(0, 3);
  var topFallers = weekChanges.filter(function(c) { return c.change < 0; }).slice(0, 3);

  var avgRank = weekChanges.reduce(function(s, c) { return s + c.currentRank; }, 0) / (weekChanges.length || 1);

  // 기간 문자열
  var endDate = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
  var startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  startDate = Utilities.formatDate(startDate, 'Asia/Seoul', 'yyyy-MM-dd');

  sendWeeklyReport({
    period: startDate + ' ~ ' + endDate,
    avgRank: Math.round(avgRank * 10) / 10,
    totalDownloads: 0, // TODO: 다운로드 합산
    topRisers: topRisers,
    topFallers: topFallers,
  });

  Logger.log('주간 리포트 발송 완료');
}

/**
 * 수동 테스트: 현재 시점에서 수집 실행
 */
function manualCollect() {
  dailyCollect();
}

/**
 * 수동 테스트: Slack 알림 테스트
 */
function testSlackAlert() {
  sendSlackAlert([
    { keyword: '수학', os: 'ios', previousRank: 5, currentRank: 2, change: 3 },
    { keyword: '교육', os: 'android', previousRank: 10, currentRank: 15, change: -5 },
  ]);
}
