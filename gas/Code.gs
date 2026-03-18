function doGet(e) {
  var action = '';
  if (e && e.parameter && e.parameter.action) {
    action = e.parameter.action;
  }
  if (action === 'config') {
    var configJson = JSON.stringify(getConfig());
    return ContentService.createTextOutput(configJson).setMimeType(ContentService.MimeType.JSON);
  }
  if (action === 'memos') {
    var memosJson = JSON.stringify(getMemos());
    return ContentService.createTextOutput(memosJson).setMimeType(ContentService.MimeType.JSON);
  }
  var defaultJson = JSON.stringify({status: 'ok'});
  return ContentService.createTextOutput(defaultJson).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var payload = JSON.parse(e.postData.contents);
  if (payload.type === 'save-memo') { saveMemo(payload.date, payload.memo); return okResponse(); }
  if (payload.type === 'update-classification') { updateClassification(payload.keyword, payload.classification); return okResponse(); }
  if (payload.type === 'adopt-suggestion') { adoptSuggestion(payload.keyword, payload.classification); return okResponse(); }
  if (payload.type === 'rankings') { writeRankings(payload.sheet, payload.date, payload.data); return okResponse(); }
  if (payload.type === 'downloads') { writeDownloads(payload.sheet, payload.date, payload.data); return okResponse(); }
  if (payload.type === 'categoryRank') { writeCategoryRank(payload.date, payload.data); return okResponse(); }
  if (payload.type === 'suggestions') { writeSuggestions(payload.data); return okResponse(); }
  if (payload.type === 'collectionLog') { writeCollectionLog(payload.data); return okResponse(); }
  return okResponse();
}

function okResponse() {
  return ContentService.createTextOutput(JSON.stringify({status: 'ok'})).setMimeType(ContentService.MimeType.JSON);
}

function getConfig() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Config');
  if (!sheet) { return {classifications: {}}; }
  var data = sheet.getDataRange().getValues();
  var classifications = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) { classifications[data[i][0]] = data[i][1] || 'unclassified'; }
  }
  return {classifications: classifications};
}

function updateClassification(keyword, classification) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Config');
  if (!sheet) {
    sheet = ss.insertSheet('Config');
    sheet.appendRow(['Keyword', 'Classification', 'UpdatedAt']);
  }
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === keyword) {
      sheet.getRange(i + 1, 2).setValue(classification);
      sheet.getRange(i + 1, 3).setValue(new Date().toISOString());
      return;
    }
  }
  sheet.appendRow([keyword, classification, new Date().toISOString()]);
}

function adoptSuggestion(keyword, classification) {
  updateClassification(keyword, classification);
}

function getMemos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Memos');
  if (!sheet) { return []; }
  var data = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][1]) {
      var dateVal;
      if (data[i][0] instanceof Date) {
        dateVal = Utilities.formatDate(data[i][0], 'Asia/Seoul', 'yyyy-MM-dd');
      } else {
        dateVal = String(data[i][0]).slice(0, 10);
      }
      result.push({date: dateVal, memo: data[i][1]});
    }
  }
  return result;
}

function saveMemo(date, memo) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Memos');
  if (!sheet) {
    sheet = ss.insertSheet('Memos');
    sheet.appendRow(['Date', 'Memo', 'UpdatedAt']);
  }
  var data = sheet.getDataRange().getValues();
  var dateStr = String(date).slice(0, 10);
  for (var i = 1; i < data.length; i++) {
    var rowDate;
    if (data[i][0] instanceof Date) {
      rowDate = Utilities.formatDate(data[i][0], 'Asia/Seoul', 'yyyy-MM-dd');
    } else {
      rowDate = String(data[i][0]).slice(0, 10);
    }
    if (rowDate === dateStr) {
      if (memo.trim() === '') {
        sheet.deleteRow(i + 1);
      } else {
        sheet.getRange(i + 1, 2).setValue(memo);
        sheet.getRange(i + 1, 3).setValue(new Date().toISOString());
      }
      return;
    }
  }
  if (memo.trim() !== '') {
    sheet.appendRow([dateStr, memo, new Date().toISOString()]);
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setNumberFormat('@');
  }
}

function findDateRow(sheet, date) {
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === date) { return i + 1; }
  }
  return -1;
}

function writeRankings(sheetName, date, rankings) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) { sheet = ss.insertSheet(sheetName); }
  var keywords = Object.keys(rankings).sort();
  if (sheet.getLastRow() === 0) {
    var header = ['Date'];
    keywords.forEach(function(kw) {
      header.push(kw + '_rank', kw + '_change', kw + '_traffic');
    });
    sheet.appendRow(header);
  }
  var row = [date];
  keywords.forEach(function(kw) {
    var d = rankings[kw];
    row.push(d.rank || '', d.change || 0, d.trafficScore || '');
  });
  var existingRow = findDateRow(sheet, date);
  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function writeDownloads(sheetName, date, rankings) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) { sheet = ss.insertSheet(sheetName); }
  var keywords = Object.keys(rankings).sort();
  if (sheet.getLastRow() === 0) {
    var header = ['Date'];
    keywords.forEach(function(kw) { header.push(kw); });
    sheet.appendRow(header);
  }
  var row = [date];
  keywords.forEach(function(kw) {
    row.push(rankings[kw].searchVolume || '');
  });
  var existingRow = findDateRow(sheet, date);
  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function writeCategoryRank(date, data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('CategoryRank');
  if (!sheet) {
    sheet = ss.insertSheet('CategoryRank');
    sheet.appendRow(['Date', 'iOS_iPhone', 'iOS_iPad', 'Android']);
  }
  var entry = data[0] || {};
  var row = [date, entry.iosIphone || '', entry.iosIpad || '', entry.android || ''];
  var existingRow = findDateRow(sheet, date);
  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function writeSuggestions(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Suggestions');
  if (!sheet) {
    sheet = ss.insertSheet('Suggestions');
    sheet.appendRow(['Keyword', 'OS', 'Rank', 'Traffic', 'SearchVolume', 'Date']);
  }
  data.forEach(function(item) {
    sheet.appendRow([item.keyword, item.os, item.rank, item.trafficScore, item.searchVolume, item.date]);
  });
}

function writeCollectionLog(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('CollectionLog');
  if (!sheet) {
    sheet = ss.insertSheet('CollectionLog');
    sheet.appendRow(['Date', 'iOS_Keywords', 'Android_Keywords', 'CategoryRank', 'Status', 'CollectedAt']);
  }
  sheet.appendRow([data.date, data.iosCount, data.androidCount, data.categoryRank || '', data.status, data.collectedAt]);
}

function resetSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var keep = ['iOS_Rankings', 'Android_Rankings', 'iOS_Downloads', 'Android_Downloads', 'CategoryRank', 'Suggestions', 'Config', 'CollectionLog', 'Memos'];
  keep.forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (sheet && sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
    }
  });
}
