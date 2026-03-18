/**
 * Google Sheets 쓰기 유틸리티
 */

/**
 * 시트가 없으면 생성하고, 헤더를 설정합니다.
 */
function ensureSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#f3f4f6');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

/**
 * 랭킹 데이터를 시트에 추가합니다.
 * 형식: | 날짜 | 키워드1 | 키워드2 | ... |
 * 한 행에 하나의 날짜, 열에 키워드별 랭킹
 *
 * @param {string} sheetName - 시트 이름
 * @param {string} date - 날짜 문자열
 * @param {Object} rankData - { 키워드: { rank, trafficScore } }
 * @param {Array} keywordOrder - 키워드 순서 배열
 */
function writeRankingRow(sheetName, date, rankData, keywordOrder) {
  var headers = ['날짜'].concat(keywordOrder);
  var sheet = ensureSheet_(sheetName, headers);

  // 기존 헤더 확인 — 새 키워드가 추가되었을 수 있음
  var existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newKeywords = keywordOrder.filter(function(kw) {
    return existingHeaders.indexOf(kw) === -1;
  });

  if (newKeywords.length > 0) {
    var startCol = existingHeaders.length + 1;
    sheet.getRange(1, startCol, 1, newKeywords.length).setValues([newKeywords]);
    existingHeaders = existingHeaders.concat(newKeywords);
  }

  // 중복 방지: 같은 날짜 행이 있으면 덮어쓰기
  var lastRow = sheet.getLastRow();
  var existingRow = -1;
  if (lastRow > 1) {
    var dates = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < dates.length; i++) {
      if (String(dates[i][0]) === date) {
        existingRow = i + 2;
        break;
      }
    }
  }

  // 데이터 행 구성
  var row = [date];
  for (var j = 1; j < existingHeaders.length; j++) {
    var kw = existingHeaders[j];
    var data = rankData[kw];
    row.push(data ? data.rank : '');
  }

  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

/**
 * 다운로드/CVR 데이터를 시트에 추가합니다.
 * 형식: | 날짜 | 키워드 | 다운로드 | CVR | 트래픽점수 |
 *
 * @param {string} sheetName
 * @param {string} date
 * @param {Array} rows - [{ keyword, downloads, cvr, trafficScore }]
 */
function writeDownloadRows(sheetName, date, rows) {
  var headers = ['날짜', '키워드', '다운로드', 'CVR(%)', '트래픽점수'];
  var sheet = ensureSheet_(sheetName, headers);

  // 기존 같은 날짜 데이터 삭제
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var dates = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    var rowsToDelete = [];
    for (var i = dates.length - 1; i >= 0; i--) {
      if (String(dates[i][0]) === date) {
        rowsToDelete.push(i + 2);
      }
    }
    // 역순으로 삭제 (인덱스 안 깨지게)
    for (var d = 0; d < rowsToDelete.length; d++) {
      sheet.deleteRow(rowsToDelete[d]);
    }
  }

  // 새 데이터 추가
  for (var r = 0; r < rows.length; r++) {
    var item = rows[r];
    sheet.appendRow([
      date,
      item.keyword,
      item.downloads || 0,
      item.cvr || 0,
      item.trafficScore || 0,
    ]);
  }
}

/**
 * 카테고리 랭킹 데이터를 시트에 추가합니다.
 * 형식: | 날짜 | iOS_순위 | Android_순위 |
 */
function writeCategoryRankRow(date, iosRank, androidRank) {
  var headers = ['날짜', 'iOS_교육카테고리', 'Android_교육카테고리'];
  var sheet = ensureSheet_(SHEETS.CATEGORY_RANK, headers);

  // 중복 방지
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var dates = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < dates.length; i++) {
      if (String(dates[i][0]) === date) {
        sheet.getRange(i + 2, 1, 1, 3).setValues([[date, iosRank, androidRank]]);
        return;
      }
    }
  }

  sheet.appendRow([date, iosRank, androidRank]);
}

/**
 * 경쟁사 랭킹 데이터를 시트에 추가합니다.
 * 형식: | 날짜 | OS | 키워드 | 콴다 | 말해보카 | 스픽 | 듀오링고 | 찰칵 |
 */
function writeCompetitorRow(date, os, keyword, qandaRank, competitorRanks) {
  var headers = ['날짜', 'OS', '키워드', '콴다', '말해보카', '스픽', '듀오링고', '찰칵'];
  var sheet = ensureSheet_(SHEETS.COMPETITORS, headers);

  sheet.appendRow([
    date,
    os,
    keyword,
    qandaRank || '',
    competitorRanks.malhaeboca || '',
    competitorRanks.speak || '',
    competitorRanks.duolingo || '',
    competitorRanks.charlcak || '',
  ]);
}

/**
 * 모든 시트를 초기 생성합니다.
 */
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Config 시트
  var configSheet = ensureSheet_(SHEETS.CONFIG, [
    '키워드', '분류', '', '알림_임계값', '알림_대상'
  ]);
  // 기본 키워드 입력
  var defaultKeywords = [
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

  if (configSheet.getLastRow() <= 1) {
    configSheet.getRange(2, 1, defaultKeywords.length, 2).setValues(defaultKeywords);
    configSheet.getRange('D2').setValue(3);        // 알림 임계값
    configSheet.getRange('E2').setValue('all');     // 알림 대상
  }

  // 나머지 시트 생성
  ensureSheet_(SHEETS.IOS_RANKINGS, ['날짜']);
  ensureSheet_(SHEETS.ANDROID_RANKINGS, ['날짜']);
  ensureSheet_(SHEETS.IOS_DOWNLOADS, ['날짜', '키워드', '다운로드', 'CVR(%)', '트래픽점수']);
  ensureSheet_(SHEETS.ANDROID_DOWNLOADS, ['날짜', '키워드', '다운로드', 'CVR(%)', '트래픽점수']);
  ensureSheet_(SHEETS.CATEGORY_RANK, ['날짜', 'iOS_교육카테고리', 'Android_교육카테고리']);
  ensureSheet_(SHEETS.COMPETITORS, ['날짜', 'OS', '키워드', '콴다', '말해보카', '스픽', '듀오링고', '찰칵']);
  ensureSheet_(SHEETS.SUGGESTIONS, ['날짜', 'OS', '키워드', '트래픽점수', '랭킹', '카테고리']);
  ensureSheet_(SHEETS.ALERT_LOG, ['날짜시간', '키워드', 'OS', '변동', '현재랭킹', '알림상태']);

  Logger.log('모든 시트가 생성되었습니다.');
  SpreadsheetApp.getUi().alert('시트 초기 설정이 완료되었습니다!');
}
