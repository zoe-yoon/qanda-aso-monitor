/**
 * ASO 주간 리포트 생성 & Slack 전송
 *
 * 사용: node src/weekly-report.js
 *
 * 기간 산정:
 *   - 이번 주: 최근 7일 중 가장 마지막 수집일 데이터
 *   - 지난 주: 그로부터 7일 전 가장 가까운 수집일 데이터
 *   - 순위 변화 = 지난 주 순위 - 이번 주 순위 (양수 = 상승)
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config as cfg } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const ENV_PATH = join(__dirname, '..', '.env');

// .env 로드
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

const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL_ID = process.env.SLACK_CHANNEL_ID || 'C0AKK2TV5GD';

// 날짜 유틸
function fmt(d) { return d.toISOString().slice(0, 10); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function shortDate(dateStr) { return dateStr.slice(5).replace('-', '.'); } // "03.18"

// 가장 가까운 수집 데이터 파일 찾기 (targetDate 이전으로 탐색)
function findClosestData(targetDate, maxLookback = 5) {
  for (let i = 0; i <= maxLookback; i++) {
    const d = fmt(addDays(targetDate, -i));
    const path = join(DATA_DIR, `st-${d}.json`);
    if (existsSync(path)) {
      return { date: d, data: JSON.parse(readFileSync(path, 'utf-8')) };
    }
  }
  return null;
}

// 순위 변화 계산 (OS별)
function computeRankChanges(thisWeek, lastWeek, osKey) {
  const thisRankings = thisWeek.data[osKey] || {};
  const lastRankings = lastWeek.data[osKey] || {};
  const changes = [];

  for (const [keyword, info] of Object.entries(thisRankings)) {
    const lastInfo = lastRankings[keyword];
    if (!lastInfo) continue;
    const change = lastInfo.rank - info.rank; // 양수 = 상승
    changes.push({
      keyword,
      rank: info.rank,
      prevRank: lastInfo.rank,
      change,
      trafficScore: info.trafficScore,
    });
  }

  return changes;
}

const classifiedNames = new Set(cfg.keywords.map(k => k.name));
const NOISE_KEYWORDS = new Set(['콴다', 'qanda', 'null', 'undefined', '']);

// 메시지 빌드
function buildReport() {
  const today = new Date();
  const thisWeekEnd = today;
  const thisWeekStart = addDays(today, -6);
  const lastWeekEnd = addDays(today, -7);

  // 데이터 찾기
  const thisWeek = findClosestData(thisWeekEnd);
  const lastWeek = findClosestData(lastWeekEnd);

  if (!thisWeek) {
    return '❌ 주간 리포트 생성 실패: 이번 주 수집 데이터가 없습니다.';
  }
  const hasComparison = !!lastWeek;

  const period = `${shortDate(fmt(thisWeekStart))} ~ ${shortDate(thisWeek.date)}`;
  const basisNote = hasComparison
    ? `기준: ${shortDate(thisWeek.date)} vs ${shortDate(lastWeek.date)} 데이터 비교`
    : `기준: ${shortDate(thisWeek.date)} 데이터 (비교 데이터 없음)`;

  // 카테고리 랭킹
  const thisCat = thisWeek.data.categoryRankings?.slice(-1)[0];
  const lastCat = hasComparison ? lastWeek.data.categoryRankings?.slice(-1)[0] : null;

  // OS별 섹션 빌드
  const sections = [];

  for (const [osLabel, osKey] of [['iOS', 'iosRankings'], ['Android', 'androidRankings']]) {
    const changes = hasComparison ? computeRankChanges(thisWeek, lastWeek, osKey) : [];
    const risers = changes.filter(c => c.change > 0).sort((a, b) => b.change - a.change).slice(0, 3);
    const fallers = changes.filter(c => c.change < 0).sort((a, b) => a.change - b.change).slice(0, 3);

    // 제안 키워드
    const rankings = thisWeek.data[osKey] || {};
    const suggestions = Object.entries(rankings)
      .filter(([name, info]) => !classifiedNames.has(name) && !NOISE_KEYWORDS.has(name) && info.trafficScore >= 3.0)
      .sort((a, b) => b[1].trafficScore - a[1].trafficScore)
      .slice(0, 5)
      .map(([name, info]) => ({ keyword: name, rank: info.rank, traffic: info.trafficScore }));

    // KPI
    const allRanks = Object.values(thisWeek.data[osKey] || {}).map(v => v.rank).filter(r => r > 0);
    const avgRank = allRanks.length ? (allRanks.reduce((s, r) => s + r, 0) / allRanks.length).toFixed(1) : '-';
    const keywordCount = Object.keys(thisWeek.data[osKey] || {}).length;

    // 카테고리
    let catRank = '-';
    let catChange = '';
    if (osLabel === 'iOS' && thisCat) {
      catRank = `${thisCat.iosIphone}위`;
      if (lastCat) {
        const diff = lastCat.iosIphone - thisCat.iosIphone;
        catChange = diff > 0 ? ` (↑${diff})` : diff < 0 ? ` (↓${Math.abs(diff)})` : ' (→)';
      }
    } else if (osLabel === 'Android' && thisCat) {
      catRank = `${thisCat.android}위`;
      if (lastCat) {
        const diff = lastCat.android - thisCat.android;
        catChange = diff > 0 ? ` (↑${diff})` : diff < 0 ? ` (↓${Math.abs(diff)})` : ' (→)';
      }
    }

    let section = `\n*${osLabel}*\n`;

    // 순위 상승
    section += `  📈 순위 상승 TOP 3\n`;
    if (risers.length === 0) {
      section += `    변동 없음\n`;
    } else {
      risers.forEach((r, i) => {
        section += `    ${i + 1}. ${r.keyword}  ${r.prevRank}위 → ${r.rank}위 (+${r.change})\n`;
      });
    }

    // 순위 하락
    section += `  📉 순위 하락 TOP 3\n`;
    if (fallers.length === 0) {
      section += `    변동 없음\n`;
    } else {
      fallers.forEach((r, i) => {
        section += `    ${i + 1}. ${r.keyword}  ${r.prevRank}위 → ${r.rank}위 (${r.change})\n`;
      });
    }

    // KPI
    section += `  🏆 키워드 ${keywordCount}개 | 평균 순위 ${avgRank}위 | 교육 카테고리 ${catRank}${catChange}\n`;

    // 제안 키워드
    if (suggestions.length > 0) {
      section += `  💡 제안 키워드\n`;
      suggestions.forEach(s => {
        section += `    • ${s.keyword} (${s.rank}위, 트래픽 ${s.traffic})\n`;
      });
    }

    sections.push(section);
  }

  let msg = `📊 *ASO 주간 리포트* (${period})\n`;
  msg += `_${basisNote}_\n`;
  msg += sections.join('');

  // 앱 개요
  if (thisWeek.data.overview) {
    const o = thisWeek.data.overview;
    msg += `\n📱 *앱 개요*\n`;
    msg += `  • 다운로드: ${o.downloads || '-'} | 수익: ${o.revenue || '-'} | DAU: ${o.dau || '-'}\n`;
  }

  msg += `\n🔗 <https://qanda-aso-monitor.vercel.app|대시보드>`;
  msg += ` · <https://docs.google.com/spreadsheets/d/1_yhVkbX28GOHwgvMavPt2ulLGxZoMojdcjVfgJvP2KM|스프레드시트>`;

  return msg;
}

async function send(message) {
  if (!BOT_TOKEN) {
    console.error('SLACK_BOT_TOKEN이 설정되지 않았습니다.');
    console.log('보내려던 메시지:\n', message);
    return;
  }

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
    console.log(`[Slack] 주간 리포트 전송 완료 → ${CHANNEL_ID}`);
  } else {
    console.error(`[Slack] 전송 실패: ${data.error}`);
    process.exit(1);
  }
}

try {
  const report = buildReport();
  console.log(report);
  console.log('\n---');
  await send(report);
} catch (err) {
  console.error('주간 리포트 생성 오류:', err);
  process.exit(1);
}
