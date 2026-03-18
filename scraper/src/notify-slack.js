/**
 * Slack 알림 전송
 *
 * 사용: node src/notify-slack.js <type> [message]
 *   type: "success" | "session-expired" | "error"
 *
 * 환경변수: SLACK_WEBHOOK_URL (Incoming Webhook URL)
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = join(__dirname, '..', '.env');

// .env 파일에서 환경변수 로드
function loadEnv() {
  if (!existsSync(ENV_PATH)) return;
  const lines = readFileSync(ENV_PATH, 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^(\w+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL_ID = process.env.SLACK_CHANNEL_ID || 'C0AKK2TV5GD'; // #aso-monitor 채널

const type = process.argv[2] || 'success';
const extraMsg = process.argv.slice(3).join(' ');
const today = new Date().toISOString().slice(0, 10);

// 데이터 파일에서 요약 정보 추출
function getDataSummary() {
  try {
    const dataPath = join(__dirname, '..', 'data', `st-${today}.json`);
    const raw = JSON.parse(readFileSync(dataPath, 'utf-8'));
    const iosCount = Object.keys(raw.iosRankings || {}).length;
    const androidCount = Object.keys(raw.androidRankings || {}).length;
    const catLen = Array.isArray(raw.categoryRankings) ? raw.categoryRankings.length : 0;
    const latest = Array.isArray(raw.categoryRankings) ? raw.categoryRankings[raw.categoryRankings.length - 1] : null;
    return { iosCount, androidCount, catLen, latest, overview: raw.overview };
  } catch {
    return null;
  }
}

function buildMessage() {
  if (type === 'success') {
    const summary = getDataSummary();
    let text = `✅ *ASO Monitor 일일 수집 완료* (${today})\n`;
    if (summary) {
      text += `• iOS 키워드: ${summary.iosCount}개\n`;
      text += `• Android 키워드: ${summary.androidCount}개\n`;
      if (summary.latest) {
        text += `• 교육 카테고리: iOS ${summary.latest.iosIphone}위 / Android ${summary.latest.android}위\n`;
      }
      if (summary.overview) {
        const o = summary.overview;
        text += `• 앱 개요: 다운로드 ${o.downloads || '-'}, 수익 ${o.revenue || '-'}, DAU ${o.dau || '-'}\n`;
      }
    }
    text += `• 대시보드: https://qanda-aso-monitor.vercel.app\n`;
    text += `• 스프레드시트: https://docs.google.com/spreadsheets/d/1_yhVkbX28GOHwgvMavPt2ulLGxZoMojdcjVfgJvP2KM`;
    return text;
  }

  if (type === 'session-expired') {
    return `🚨 *ASO Monitor 세션 만료!*\n세션이 만료되어 데이터 수집에 실패했습니다.\n\`\`\`cd ~/.wizard/output/aso-keyword-monitor/scraper && npm run test-login\`\`\`\n위 명령어로 세션을 갱신해주세요.`;
  }

  if (type === 'error') {
    return `❌ *ASO Monitor 수집 오류* (${today})\n${extraMsg || '알 수 없는 오류가 발생했습니다.'}\n로그 확인: \`cat scraper/logs/daily-${today}.log\``;
  }

  return `ℹ️ ASO Monitor: ${extraMsg || type}`;
}

async function send() {
  const message = buildMessage();

  // 방법 1: Bot Token (채널 전송)
  if (BOT_TOKEN) {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BOT_TOKEN}`,
      },
      body: JSON.stringify({ channel: CHANNEL_ID, text: message }),
    });
    const data = await res.json();
    if (data.ok) {
      console.log(`[Slack] ${type} 알림 전송 완료 (Bot Token → ${CHANNEL_ID})`);
    } else {
      console.error(`[Slack] 전송 실패: ${data.error}`);
      process.exit(1);
    }
    return;
  }

  // 방법 2: Incoming Webhook (채널만 지원)
  if (WEBHOOK_URL) {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
    if (res.ok) {
      console.log(`[Slack] ${type} 알림 전송 완료 (Webhook)`);
    } else {
      console.error(`[Slack] 전송 실패: ${res.status} ${await res.text()}`);
      process.exit(1);
    }
    return;
  }

  console.error('SLACK_BOT_TOKEN 또는 SLACK_WEBHOOK_URL이 설정되지 않았습니다. scraper/.env 파일을 확인하세요.');
  console.log('보내려던 메시지:', message);
}

send().catch(console.error);
