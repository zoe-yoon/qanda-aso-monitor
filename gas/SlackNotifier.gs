/**
 * Slack Webhook 알림 발송
 */

/**
 * Slack으로 랭킹 변동 알림을 보냅니다.
 *
 * @param {Array} changes - [{ keyword, os, previousRank, currentRank, change }]
 */
function sendSlackAlert(changes) {
  var webhookUrl = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');
  if (!webhookUrl) {
    Logger.log('SLACK_WEBHOOK_URL 미설정, 알림 건너뜀');
    return;
  }

  if (!changes || changes.length === 0) return;

  var today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm');

  var blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🔔 ASO 키워드 랭킹 변동 알림',
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: today + ' KST',
        },
      ],
    },
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
    elements: [
      {
        type: 'mrkdwn',
        text: '총 ' + changes.length + '개 키워드 변동 | <' + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '|시트 열기>',
      },
    ],
  });

  var payload = { blocks: blocks };

  try {
    UrlFetchApp.fetch(webhookUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });
    Logger.log('Slack 알림 발송 완료: ' + changes.length + '건');
  } catch (e) {
    Logger.log('Slack 알림 발송 실패: ' + e.message);
  }

  // 알림 로그 기록
  logAlerts_(changes);
}

/**
 * 알림 이력을 AlertLog 시트에 기록합니다.
 */
function logAlerts_(changes) {
  var sheet = ensureSheet_(SHEETS.ALERT_LOG, ['날짜시간', '키워드', 'OS', '변동', '현재랭킹', '알림상태']);
  var now = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

  for (var i = 0; i < changes.length; i++) {
    var c = changes[i];
    sheet.appendRow([
      now,
      c.keyword,
      c.os,
      c.change,
      c.currentRank,
      '발송완료',
    ]);
  }
}

/**
 * 주간 리포트 요약을 Slack으로 보냅니다.
 *
 * @param {Object} summary - { period, avgRank, totalDownloads, topRisers, topFallers }
 */
function sendWeeklyReport(summary) {
  var webhookUrl = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');
  if (!webhookUrl) return;

  var risersText = summary.topRisers.map(function(r) {
    return '🔺 ' + r.keyword + ' (+' + r.change + ')';
  }).join('\n');

  var fallersText = summary.topFallers.map(function(f) {
    return '🔻 ' + f.keyword + ' (' + f.change + ')';
  }).join('\n');

  var payload = {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '📊 ASO 주간 리포트 (' + summary.period + ')' },
      },
      { type: 'divider' },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: '*평균 랭킹*\n' + summary.avgRank + '위' },
          { type: 'mrkdwn', text: '*총 다운로드*\n' + summary.totalDownloads.toLocaleString() },
        ],
      },
      { type: 'divider' },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*상승 Top 3*\n' + risersText },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: '*하락 Top 3*\n' + fallersText },
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: '<' + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '|전체 리포트 보기>' },
        ],
      },
    ],
  };

  UrlFetchApp.fetch(webhookUrl, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
}
