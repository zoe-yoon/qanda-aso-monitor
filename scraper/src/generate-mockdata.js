/**
 * 수집된 Sensor Tower JSON → mockup의 mockData.ts로 변환
 *
 * 사용: node src/generate-mockdata.js
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRAPER_ROOT = join(__dirname, '..');
const MOCKUP_ROOT = join(SCRAPER_ROOT, '..', 'mockup');

// 오늘 날짜의 수집 데이터 읽기
const today = new Date().toISOString().slice(0, 10);
const dataPath = join(SCRAPER_ROOT, 'data', `st-${today}.json`);
const raw = JSON.parse(readFileSync(dataPath, 'utf-8'));

// 키워드 분류 (config.js 기반)
const PRIMARY = ['수학', '문제 풀이', '답지', '교육', '공부', '시험', '풀이'];
const SECONDARY = ['ai 공부', '내신', '모의고사', '영단어', '기출', '공부 타이머', '과학'];
const KNOWN = new Set([...PRIMARY, ...SECONDARY]);

function classify(name) {
  if (PRIMARY.includes(name)) return 'primary';
  if (SECONDARY.includes(name)) return 'secondary';
  return 'unclassified';
}

// ST delta → mockup change 변환 (부호 반전)
// ST: delta = current - previous (양수 = 순위 하락)
// Mockup: change = previous - current (양수 = 순위 상승)
function convertChange(stDelta) {
  return -(stDelta || 0);
}

function convertKeywords(rankings) {
  return Object.entries(rankings)
    .filter(([name, data]) => name !== 'null' && data.rank != null)
    .sort((a, b) => a[1].rank - b[1].rank)
    .map(([name, data], idx) => {
      const change = convertChange(data.change);
      const currentRank = data.rank;
      const previousRank = currentRank - change; // prev = current - mockupChange = current + stDelta
      // sparkline: 현재 순위 기반 7일 모의 데이터
      const sparkline = Array.from({ length: 7 }, (_, i) => {
        const variation = Math.round(Math.sin(i * 0.8) * Math.max(1, Math.abs(change)));
        return Math.max(1, previousRank + Math.round((currentRank - previousRank) * (i / 6)) + variation);
      });

      return {
        id: `kw-${idx + 1}`,
        name,
        classification: classify(name),
        currentRank,
        previousRank: Math.max(1, previousRank),
        change,
        trafficScore: data.trafficScore ?? 0,
        downloads: data.searchVolume ?? 0,
        cvr: 0, // Sensor Tower에서 제공 안 됨
        sparkline,
      };
    });
}

const iosKeywords = convertKeywords(raw.iosRankings);
const androidKeywords = convertKeywords(raw.androidRankings);

// ─── 카테고리 랭킹 30일 히스토리 (수집 시 한번에 30일 가져옴) ───
const categoryHistory = Array.isArray(raw.categoryRankings) ? raw.categoryRankings : [];
console.log(`   카테고리 히스토리: ${categoryHistory.length}일`);

function generateCategoryTrend() {
  return categoryHistory.map(h => {
    const d = new Date(h.date);
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      fullDate: h.date,
      iosIphone: h.iosIphone ?? null,
      iosIpad: h.iosIpad ?? null,
      android: h.android ?? null,
    };
  });
}

// ─── 키워드 제안 생성 ───
// 기준: 미분류 + 트래픽 3.0 이상 + 브랜드 변형 제외
// 교육/학습 연관 키워드에 가중치

const BRAND_PATTERNS = [
  /^콴/, /^qanda/i, /^quanda/i, /^qunda/i, /^환다/, /^쾬다/, /^칸다/, /^콰다/,
  /^판다$/, /^칸타타$/, /^canada$/i,
];

const CATEGORY_RULES = [
  { pattern: /수학|math|數学/i, category: '수학/풀이' },
  { pattern: /문제|풀이|답|해설/i, category: '수학/풀이' },
  { pattern: /공부|학습|study|스터디/i, category: '교육/학습' },
  { pattern: /시험|내신|모의고사|기출|ebs/i, category: '시험/입시' },
  { pattern: /과외|과학|교육/i, category: '교육/학습' },
  { pattern: /앱|app/i, category: '앱/서비스' },
  { pattern: /영단어|영어|english/i, category: '어학' },
];

function isBrandKeyword(name) {
  return BRAND_PATTERNS.some(p => p.test(name));
}

function categorize(name) {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(name)) return rule.category;
  }
  return '기타';
}

function generateSuggestions(keywords) {
  return keywords
    .filter(k => k.classification === 'unclassified')
    .filter(k => k.trafficScore >= 3.0)
    .filter(k => !isBrandKeyword(k.name))
    .filter(k => k.name !== 'null')
    .map((k, idx) => ({
      id: `sg-${idx + 1}`,
      name: k.name,
      trafficScore: k.trafficScore,
      currentRank: k.currentRank,
      category: categorize(k.name),
      isMonitored: false,
      reason: k.change > 0
        ? `순위 ${k.change}단계 상승 중, 트래픽 ${k.trafficScore}`
        : k.currentRank <= 10
          ? `Top 10 유지 중, 트래픽 ${k.trafficScore}`
          : `트래픽 ${k.trafficScore}, 검색량 ${k.downloads.toLocaleString()}`,
    }))
    .sort((a, b) => b.trafficScore - a.trafficScore);
}

// 주간 리포트 생성
function generateReport(keywords) {
  const sorted = [...keywords].sort((a, b) => b.change - a.change);
  const topRisers = sorted.filter(k => k.change > 0).slice(0, 3).map(k => ({ keyword: k.name, change: k.change }));
  const topFallers = sorted.filter(k => k.change < 0).slice(-3).reverse().map(k => ({ keyword: k.name, change: k.change }));
  const ranked = keywords.filter(k => k.currentRank);
  const avgRank = ranked.length ? Math.round((ranked.reduce((s, k) => s + k.currentRank, 0) / ranked.length) * 10) / 10 : 0;
  const avgChange = ranked.length ? Math.round((ranked.reduce((s, k) => s + k.change, 0) / ranked.length) * 10) / 10 : 0;
  const totalDl = keywords.reduce((s, k) => s + k.downloads, 0);

  return {
    period: `${new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)} ~ ${today}`,
    generatedAt: `${today} 07:00`,
    highlights: { topRisers, topFallers },
    kpiSummary: {
      avgRank,
      avgRankChange: avgChange,
      totalDownloads: totalDl,
      totalDownloadsChange: 0,
      avgCvr: 0,
      avgCvrChange: 0,
    },
    asoScore: Math.min(100, Math.round(80 + avgChange * 2)),
    asoScoreTarget: 85,
  };
}

// TypeScript 코드 생성
function toTS(obj, indent = 2) {
  return JSON.stringify(obj, null, indent)
    .replace(/"(\w+)":/g, '$1:')  // 키 따옴표 제거
    .replace(/null/g, 'null');
}

const now = `${today} ${new Date().toTimeString().slice(0, 5)}`;

const output = `// Real data from Sensor Tower — generated ${today}
// Run: cd scraper && node src/generate-mockdata.js
// Source: data/st-${today}.json

import type { OS } from "@/contexts/OSContext";

export type KeywordClassification = "primary" | "secondary" | "unclassified";

export interface Keyword {
  id: string;
  name: string;
  classification: KeywordClassification;
  currentRank: number;
  previousRank: number;
  change: number;
  trafficScore: number;
  downloads: number;
  cvr: number;
  sparkline: number[];
}

export interface SuggestedKeyword {
  id: string;
  name: string;
  trafficScore: number;
  currentRank: number | null;
  category: string;
  isMonitored: boolean;
  reason: string;
}

export interface DataCollectionStatus {
  source: "sensor-tower";
  label: string;
  status: "success" | "error" | "stale";
  lastUpdated: string;
}

export interface WeeklyReport {
  period: string;
  generatedAt: string;
  highlights: {
    topRisers: { keyword: string; change: number }[];
    topFallers: { keyword: string; change: number }[];
  };
  kpiSummary: {
    avgRank: number;
    avgRankChange: number;
    totalDownloads: number;
    totalDownloadsChange: number;
    avgCvr: number;
    avgCvrChange: number;
  };
  asoScore: number;
  asoScoreTarget: number;
}

export interface CategoryRankPoint {
  date: string;
  fullDate: string;
  iosIphone: number | null;
  iosIpad: number | null;
  android: number | null;
}

// ─── Category Ranking Trend (Sensor Tower ${today}) ───

export const categoryRankTrend: CategoryRankPoint[] = ${JSON.stringify(generateCategoryTrend(), null, 2)};

// ─── iOS Data (Sensor Tower ${today}) ───

const iosCollectionStatus: DataCollectionStatus[] = [
  { source: "sensor-tower", label: "Sensor Tower", status: "success", lastUpdated: "${now}" },
];

const iosKeywords: Keyword[] = ${JSON.stringify(iosKeywords, null, 2)};

const iosSuggestedKeywords: SuggestedKeyword[] = ${JSON.stringify(generateSuggestions(iosKeywords), null, 2)};

const iosWeeklyReport: WeeklyReport = ${JSON.stringify(generateReport(iosKeywords), null, 2)};

// ─── Android Data (Sensor Tower ${today}) ───

const androidCollectionStatus: DataCollectionStatus[] = [
  { source: "sensor-tower", label: "Sensor Tower", status: "success", lastUpdated: "${now}" },
];

const androidKeywords: Keyword[] = ${JSON.stringify(androidKeywords, null, 2)};

const androidSuggestedKeywords: SuggestedKeyword[] = ${JSON.stringify(generateSuggestions(androidKeywords), null, 2)};

const androidWeeklyReport: WeeklyReport = ${JSON.stringify(generateReport(androidKeywords), null, 2)};

// ─── OS-aware data accessors ───

const osData = {
  ios: {
    collectionStatus: iosCollectionStatus,
    keywords: iosKeywords,
    suggestedKeywords: iosSuggestedKeywords,
    weeklyReport: iosWeeklyReport,
  },
  android: {
    collectionStatus: androidCollectionStatus,
    keywords: androidKeywords,
    suggestedKeywords: androidSuggestedKeywords,
    weeklyReport: androidWeeklyReport,
  },
};

export function getCollectionStatus(os: OS): DataCollectionStatus[] {
  return osData[os].collectionStatus;
}

export function getKeywords(os: OS): Keyword[] {
  return osData[os].keywords;
}

export function getSuggestedKeywords(os: OS): SuggestedKeyword[] {
  return osData[os].suggestedKeywords;
}

export function getWeeklyReport(os: OS): WeeklyReport {
  return osData[os].weeklyReport;
}

// Legacy exports
export const collectionStatus = iosCollectionStatus;
export const keywords = iosKeywords;
export const suggestedKeywords = iosSuggestedKeywords;
export const weeklyReport = iosWeeklyReport;
`;

const outPath = join(MOCKUP_ROOT, 'src', 'data', 'mockData.ts');
writeFileSync(outPath, output);

console.log(`✅ mockData.ts 생성 완료: ${outPath}`);
console.log(`   iOS 키워드: ${iosKeywords.length}개`);
console.log(`   Android 키워드: ${androidKeywords.length}개`);
console.log(`   주력(방어): ${iosKeywords.filter(k => k.classification === 'primary').length} iOS / ${androidKeywords.filter(k => k.classification === 'primary').length} Android`);
console.log(`   보조(확장): ${iosKeywords.filter(k => k.classification === 'secondary').length} iOS / ${androidKeywords.filter(k => k.classification === 'secondary').length} Android`);
console.log(`   미분류: ${iosKeywords.filter(k => k.classification === 'unclassified').length} iOS / ${androidKeywords.filter(k => k.classification === 'unclassified').length} Android`);
