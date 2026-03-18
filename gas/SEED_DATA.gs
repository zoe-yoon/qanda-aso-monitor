/**
 * 시트에 30일치 시드 데이터를 채웁니다.
 * setupAll() 실행 후 1회 실행하세요.
 */
function seedAllData() {
  seedConfig_();
  seedIosRankings_();
  seedAndroidRankings_();
  seedIosDownloads_();
  seedAndroidDownloads_();
  seedCategoryRank_();
  seedCompetitors_();
  seedSuggestions_();

  SpreadsheetApp.getActiveSpreadsheet().toast('30일치 시드 데이터 입력 완료!', 'ASO Monitor', 5);
  Logger.log('=== 시드 데이터 입력 완료 ===');
}

// ─── 키워드 정의 ───
var KW_ALL = ['수학','문제 풀이','답지','교육','공부','시험','풀이','ai 공부','내신','모의고사','영단어','기출','공부 타이머','과학'];
var KW_CLASS = ['primary','primary','primary','primary','primary','primary','primary','secondary','secondary','secondary','secondary','secondary','secondary','secondary'];

// iOS 현재 랭킹 & 트래픽
var IOS_RANK =  [3, 5, 1, 12, 7, 6, 4, 18, 15, 22, 45, 19, 35, 28];
var IOS_TS   =  [8.2, 6.8, 7.5, 9.1, 7.9, 6.5, 5.8, 4.2, 5.1, 4.8, 3.5, 4.0, 3.2, 3.8];
var IOS_DL   =  [1250, 890, 2100, 450, 780, 620, 560, 120, 280, 95, 35, 150, 45, 70];
var IOS_CVR  =  [4.2, 3.8, 5.1, 1.2, 2.9, 3.1, 3.5, 1.8, 2.4, 1.5, 0.8, 2.0, 1.1, 1.3];
// iOS 7일 sparkline (오래된 → 최신)
var IOS_SPARK = [
  [2,2,3,2,2,3,3],[5,5,6,5,5,5,5],[1,1,1,1,1,1,1],[8,9,10,10,11,11,12],
  [10,9,9,8,8,7,7],[8,7,7,7,7,6,6],[4,4,4,4,4,4,4],[25,23,22,21,20,19,18],
  [15,15,15,16,15,15,15],[28,27,26,25,24,23,22],[40,41,42,42,43,44,45],
  [21,21,20,20,20,19,19],[40,39,38,38,37,36,35],[32,31,30,30,29,29,28]
];

// Android 현재 랭킹 & 트래픽
var AND_RANK =  [5, 8, 2, 18, 10, 9, 6, 25, 20, 30, 38, 22, 42, 33];
var AND_TS   =  [9.0, 7.2, 8.0, 9.8, 8.5, 7.0, 6.2, 4.8, 5.5, 5.2, 4.0, 4.5, 3.8, 4.2];
var AND_DL   =  [2800, 1950, 4200, 980, 1600, 1350, 1100, 350, 520, 210, 85, 320, 95, 150];
var AND_CVR  =  [3.1, 2.9, 4.0, 0.8, 2.1, 2.4, 2.8, 1.2, 1.8, 1.0, 0.6, 1.5, 0.7, 0.9];
var AND_SPARK = [
  [4,4,5,4,4,5,5],[7,7,8,7,7,8,8],[2,2,2,3,2,2,2],[14,15,16,16,17,17,18],
  [13,12,12,11,11,10,10],[12,11,11,10,10,9,9],[6,6,6,7,6,6,6],[32,30,29,28,27,26,25],
  [19,19,19,20,20,20,20],[38,36,35,33,32,31,30],[33,34,35,35,36,37,38],
  [26,25,24,24,23,22,22],[50,48,47,46,44,43,42],[38,37,36,36,35,34,33]
];

// 경쟁사 (primary 키워드만)
var IOS_COMP = {
  '수학':       {m:null,s:null,d:15,c:null},
  '문제 풀이':  {m:null,s:null,d:null,c:null},
  '답지':       {m:null,s:null,d:null,c:null},
  '교육':       {m:5,s:3,d:1,c:8},
  '공부':       {m:12,s:6,d:4,c:15},
  '시험':       {m:null,s:null,d:20,c:null},
  '풀이':       {m:null,s:null,d:null,c:null},
};
var AND_COMP = {
  '수학':       {m:null,s:null,d:10,c:null},
  '문제 풀이':  {m:null,s:null,d:null,c:null},
  '답지':       {m:null,s:null,d:null,c:null},
  '교육':       {m:8,s:5,d:2,c:12},
  '공부':       {m:15,s:9,d:6,c:20},
  '시험':       {m:null,s:null,d:25,c:null},
  '풀이':       {m:null,s:null,d:null,c:null},
};

// ─── 유틸 ───
function dateStr_(daysAgo) {
  var d = new Date(2026, 2, 10); // 2026-03-10
  d.setDate(d.getDate() - daysAgo);
  return Utilities.formatDate(d, 'Asia/Seoul', 'yyyy-MM-dd');
}

/** sparkline 7일을 30일로 보간 */
function expandTo30_(spark7, currentRank) {
  var result = [];
  // day 0~22: 선형 보간 (spark7[0] 기준 ±랜덤)
  var baseRank = spark7[0] + 3; // 30일 전은 약간 더 나빴다고 가정
  for (var d = 0; d < 23; d++) {
    var progress = d / 22;
    var val = Math.round(baseRank + (spark7[0] - baseRank) * progress + (Math.random() * 2 - 1));
    result.push(Math.max(1, val));
  }
  // day 23~29: sparkline 실제 데이터
  for (var s = 0; s < 7; s++) {
    result.push(spark7[s]);
  }
  return result;
}

/** 다운로드 30일 생성 (현재값 기준 ±15% 변동) */
function generateDl30_(baseDl) {
  var result = [];
  for (var d = 0; d < 30; d++) {
    var factor = 0.85 + Math.random() * 0.30; // 0.85~1.15
    result.push(Math.round(baseDl * factor));
  }
  return result;
}

/** CVR 30일 생성 */
function generateCvr30_(baseCvr) {
  var result = [];
  for (var d = 0; d < 30; d++) {
    var val = baseCvr + (Math.random() * 0.6 - 0.3);
    result.push(Math.round(val * 10) / 10);
  }
  return result;
}

// ─── Config ───
function seedConfig_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Config');
  if (!sheet) {
    Logger.log('Config 시트가 없습니다. setupAll()을 먼저 실행하세요.');
    return;
  }

  // 기존 데이터 초기화 (헤더 제외)
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
  }

  var data = [];
  for (var i = 0; i < KW_ALL.length; i++) {
    data.push([KW_ALL[i], KW_CLASS[i]]);
  }
  sheet.getRange(2, 1, data.length, 2).setValues(data);

  // 설정값
  sheet.getRange('D2').setValue(3);              // 알림 임계값
  sheet.getRange('E2').setValue('all');           // 알림 대상
  sheet.getRange('D3').setValue('SENSOR_TOWER_API_KEY');
  sheet.getRange('E3').setValue('');
  sheet.getRange('D5').setValue('데이터소스');
  sheet.getRange('E5').setValue('sensor-tower');

  Logger.log('Config 시드 완료');
}

// ─── iOS Rankings (30일) ───
function seedIosRankings_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('iOS_Rankings');
  if (!sheet) { sheet = ss.insertSheet('iOS_Rankings'); }

  // 헤더
  var headers = ['날짜'].concat(KW_ALL);
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f4f6');
  sheet.setFrozenRows(1);

  // 30일치 데이터 생성
  var expanded = [];
  for (var k = 0; k < KW_ALL.length; k++) {
    expanded.push(expandTo30_(IOS_SPARK[k], IOS_RANK[k]));
  }

  var rows = [];
  for (var d = 29; d >= 0; d--) {
    var row = [dateStr_(d)];
    for (var k = 0; k < KW_ALL.length; k++) {
      row.push(expanded[k][29 - d]);
    }
    rows.push(row);
  }

  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  Logger.log('iOS_Rankings 시드 완료: ' + rows.length + '행');
}

// ─── Android Rankings (30일) ───
function seedAndroidRankings_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Android_Rankings');
  if (!sheet) { sheet = ss.insertSheet('Android_Rankings'); }

  var headers = ['날짜'].concat(KW_ALL);
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f4f6');
  sheet.setFrozenRows(1);

  var expanded = [];
  for (var k = 0; k < KW_ALL.length; k++) {
    expanded.push(expandTo30_(AND_SPARK[k], AND_RANK[k]));
  }

  var rows = [];
  for (var d = 29; d >= 0; d--) {
    var row = [dateStr_(d)];
    for (var k = 0; k < KW_ALL.length; k++) {
      row.push(expanded[k][29 - d]);
    }
    rows.push(row);
  }

  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  Logger.log('Android_Rankings 시드 완료: ' + rows.length + '행');
}

// ─── iOS Downloads (30일) ───
function seedIosDownloads_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('iOS_Downloads');
  if (!sheet) { sheet = ss.insertSheet('iOS_Downloads'); }

  var headers = ['날짜', '키워드', '다운로드', 'CVR(%)', '트래픽점수'];
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f4f6');
  sheet.setFrozenRows(1);

  var rows = [];
  for (var k = 0; k < KW_ALL.length; k++) {
    var dls = generateDl30_(IOS_DL[k]);
    var cvrs = generateCvr30_(IOS_CVR[k]);
    for (var d = 29; d >= 0; d--) {
      rows.push([
        dateStr_(d),
        KW_ALL[k],
        dls[29 - d],
        cvrs[29 - d],
        IOS_TS[k] + (Math.random() * 0.4 - 0.2)
      ]);
    }
  }

  // 배치 쓰기 (appendRow 대신)
  sheet.getRange(2, 1, rows.length, 5).setValues(rows);
  Logger.log('iOS_Downloads 시드 완료: ' + rows.length + '행');
}

// ─── Android Downloads (30일) ───
function seedAndroidDownloads_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Android_Downloads');
  if (!sheet) { sheet = ss.insertSheet('Android_Downloads'); }

  var headers = ['날짜', '키워드', '다운로드', 'CVR(%)', '트래픽점수'];
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f4f6');
  sheet.setFrozenRows(1);

  var rows = [];
  for (var k = 0; k < KW_ALL.length; k++) {
    var dls = generateDl30_(AND_DL[k]);
    var cvrs = generateCvr30_(AND_CVR[k]);
    for (var d = 29; d >= 0; d--) {
      rows.push([
        dateStr_(d),
        KW_ALL[k],
        dls[29 - d],
        cvrs[29 - d],
        AND_TS[k] + (Math.random() * 0.4 - 0.2)
      ]);
    }
  }

  sheet.getRange(2, 1, rows.length, 5).setValues(rows);
  Logger.log('Android_Downloads 시드 완료: ' + rows.length + '행');
}

// ─── Category Rank (30일) ───
function seedCategoryRank_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('CategoryRank');
  if (!sheet) { sheet = ss.insertSheet('CategoryRank'); }

  var headers = ['날짜', 'iOS_교육카테고리', 'Android_교육카테고리'];
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f4f6');
  sheet.setFrozenRows(1);

  var rows = [];
  for (var d = 29; d >= 0; d--) {
    // iOS ~8위, Android ~15위 (사인파 변동)
    var iosBase = 8 + Math.round(Math.sin(d * 0.5) * 2 + (Math.random() * 2 - 1));
    var andBase = 15 + Math.round(Math.sin(d * 0.4) * 3 + (Math.random() * 2 - 1));
    rows.push([dateStr_(d), Math.max(1, iosBase), Math.max(1, andBase)]);
  }

  sheet.getRange(2, 1, rows.length, 3).setValues(rows);
  Logger.log('CategoryRank 시드 완료: ' + rows.length + '행');
}

// ─── Competitors (primary 키워드, 최근 7일) ───
function seedCompetitors_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Competitors');
  if (!sheet) { sheet = ss.insertSheet('Competitors'); }

  var headers = ['날짜', 'OS', '키워드', '콴다', '말해보카', '스픽', '듀오링고', '찰칵'];
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f4f6');
  sheet.setFrozenRows(1);

  var primaryKw = KW_ALL.slice(0, 7);
  var rows = [];

  for (var d = 6; d >= 0; d--) {
    var date = dateStr_(d);
    for (var k = 0; k < primaryKw.length; k++) {
      var kw = primaryKw[k];

      // iOS
      var ic = IOS_COMP[kw];
      var iosQanda = IOS_SPARK[k][6 - d];
      rows.push([
        date, 'ios', kw, iosQanda,
        ic.m ? ic.m + Math.round(Math.random() * 2 - 1) : '',
        ic.s ? ic.s + Math.round(Math.random() * 2 - 1) : '',
        ic.d ? ic.d + Math.round(Math.random() * 2 - 1) : '',
        ic.c ? ic.c + Math.round(Math.random() * 2 - 1) : '',
      ]);

      // Android
      var ac = AND_COMP[kw];
      var andQanda = AND_SPARK[k][6 - d];
      rows.push([
        date, 'android', kw, andQanda,
        ac.m ? ac.m + Math.round(Math.random() * 2 - 1) : '',
        ac.s ? ac.s + Math.round(Math.random() * 2 - 1) : '',
        ac.d ? ac.d + Math.round(Math.random() * 2 - 1) : '',
        ac.c ? ac.c + Math.round(Math.random() * 2 - 1) : '',
      ]);
    }
  }

  sheet.getRange(2, 1, rows.length, 8).setValues(rows);
  Logger.log('Competitors 시드 완료: ' + rows.length + '행');
}

// ─── Suggestions ───
function seedSuggestions_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Suggestions');
  if (!sheet) { sheet = ss.insertSheet('Suggestions'); }

  var headers = ['날짜', 'OS', '키워드', '트래픽점수', '랭킹', '카테고리'];
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f4f6');
  sheet.setFrozenRows(1);

  var today = dateStr_(0);
  var iosSug = [
    ['수학 문제', 5.5, 42, '학습'],
    ['ai 수학', 4.8, 55, 'ai'],
    ['수능 수학', 4.2, '', '시험'],
    ['중학 수학', 3.9, 68, '학습'],
    ['수학 풀이 앱', 3.5, 30, '앱'],
    ['내신 준비', 3.3, 75, '시험'],
    ['영어 공부', 6.2, '', '학습'],
    ['ai 튜터', 4.5, '', 'ai'],
    ['공부 앱', 5.0, 38, '앱'],
    ['시험 준비', 3.1, 90, '시험'],
  ];
  var andSug = [
    ['수학 문제', 6.0, 35, '학습'],
    ['ai 수학', 5.2, 48, 'ai'],
    ['수능 수학', 4.5, '', '시험'],
    ['중학 수학', 4.3, 55, '학습'],
    ['수학 풀이 앱', 3.8, 22, '앱'],
    ['내신 준비', 3.6, 62, '시험'],
    ['영어 공부', 6.8, '', '학습'],
    ['ai 튜터', 5.0, '', 'ai'],
    ['공부 앱', 5.5, 28, '앱'],
    ['시험 준비', 3.4, 78, '시험'],
  ];

  var rows = [];
  for (var i = 0; i < iosSug.length; i++) {
    rows.push([today, 'ios'].concat(iosSug[i]));
  }
  for (var j = 0; j < andSug.length; j++) {
    rows.push([today, 'android'].concat(andSug[j]));
  }

  sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  Logger.log('Suggestions 시드 완료: ' + rows.length + '행');
}
