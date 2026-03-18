// Real data from Sensor Tower — generated 2026-03-18
// Run: cd scraper && node src/generate-mockdata.js
// Source: data/st-2026-03-18.json

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

// ─── Category Ranking Trend (Sensor Tower 2026-03-18) ───

export const categoryRankTrend: CategoryRankPoint[] = [
  {
    "date": "2/17",
    "fullDate": "2026-02-17",
    "iosIphone": 63,
    "iosIpad": 56,
    "android": 31
  },
  {
    "date": "2/18",
    "fullDate": "2026-02-18",
    "iosIphone": 33,
    "iosIpad": 40,
    "android": 44
  },
  {
    "date": "2/19",
    "fullDate": "2026-02-19",
    "iosIphone": 29,
    "iosIpad": 37,
    "android": 30
  },
  {
    "date": "2/20",
    "fullDate": "2026-02-20",
    "iosIphone": 29,
    "iosIpad": 39,
    "android": 19
  },
  {
    "date": "2/21",
    "fullDate": "2026-02-21",
    "iosIphone": 50,
    "iosIpad": 40,
    "android": 14
  },
  {
    "date": "2/22",
    "fullDate": "2026-02-22",
    "iosIphone": 38,
    "iosIpad": 45,
    "android": 15
  },
  {
    "date": "2/23",
    "fullDate": "2026-02-23",
    "iosIphone": 46,
    "iosIpad": 39,
    "android": 16
  },
  {
    "date": "2/24",
    "fullDate": "2026-02-24",
    "iosIphone": 54,
    "iosIpad": 35,
    "android": 18
  },
  {
    "date": "2/25",
    "fullDate": "2026-02-25",
    "iosIphone": 45,
    "iosIpad": 41,
    "android": 19
  },
  {
    "date": "2/26",
    "fullDate": "2026-02-26",
    "iosIphone": 46,
    "iosIpad": 35,
    "android": 21
  },
  {
    "date": "2/27",
    "fullDate": "2026-02-27",
    "iosIphone": 52,
    "iosIpad": 45,
    "android": 18
  },
  {
    "date": "2/28",
    "fullDate": "2026-02-28",
    "iosIphone": 59,
    "iosIpad": 47,
    "android": 15
  },
  {
    "date": "3/1",
    "fullDate": "2026-03-01",
    "iosIphone": 65,
    "iosIpad": 53,
    "android": 15
  },
  {
    "date": "3/2",
    "fullDate": "2026-03-02",
    "iosIphone": 95,
    "iosIpad": 60,
    "android": 16
  },
  {
    "date": "3/3",
    "fullDate": "2026-03-03",
    "iosIphone": 141,
    "iosIpad": 81,
    "android": 20
  },
  {
    "date": "3/4",
    "fullDate": "2026-03-04",
    "iosIphone": 99,
    "iosIpad": 72,
    "android": 31
  },
  {
    "date": "3/5",
    "fullDate": "2026-03-05",
    "iosIphone": 75,
    "iosIpad": 62,
    "android": 33
  },
  {
    "date": "3/6",
    "fullDate": "2026-03-06",
    "iosIphone": 64,
    "iosIpad": 52,
    "android": 32
  },
  {
    "date": "3/7",
    "fullDate": "2026-03-07",
    "iosIphone": 52,
    "iosIpad": 53,
    "android": 32
  },
  {
    "date": "3/8",
    "fullDate": "2026-03-08",
    "iosIphone": 43,
    "iosIpad": 52,
    "android": 28
  },
  {
    "date": "3/9",
    "fullDate": "2026-03-09",
    "iosIphone": 57,
    "iosIpad": 55,
    "android": 27
  },
  {
    "date": "3/10",
    "fullDate": "2026-03-10",
    "iosIphone": 56,
    "iosIpad": 46,
    "android": 24
  },
  {
    "date": "3/11",
    "fullDate": "2026-03-11",
    "iosIphone": 42,
    "iosIpad": 44,
    "android": 27
  },
  {
    "date": "3/12",
    "fullDate": "2026-03-12",
    "iosIphone": 43,
    "iosIpad": 41,
    "android": 29
  },
  {
    "date": "3/13",
    "fullDate": "2026-03-13",
    "iosIphone": 42,
    "iosIpad": 39,
    "android": 34
  },
  {
    "date": "3/14",
    "fullDate": "2026-03-14",
    "iosIphone": 40,
    "iosIpad": 42,
    "android": 27
  },
  {
    "date": "3/15",
    "fullDate": "2026-03-15",
    "iosIphone": 32,
    "iosIpad": 43,
    "android": 22
  },
  {
    "date": "3/16",
    "fullDate": "2026-03-16",
    "iosIphone": 38,
    "iosIpad": 37,
    "android": 21
  },
  {
    "date": "3/17",
    "fullDate": "2026-03-17",
    "iosIphone": 37,
    "iosIpad": 37,
    "android": 20
  },
  {
    "date": "3/18",
    "fullDate": "2026-03-18",
    "iosIphone": 36,
    "iosIpad": 41,
    "android": 19
  }
];

// ─── iOS Data (Sensor Tower 2026-03-18) ───

const iosCollectionStatus: DataCollectionStatus[] = [
  { source: "sensor-tower", label: "Sensor Tower", status: "success", lastUpdated: "2026-03-18 02:52" },
];

const iosKeywords: Keyword[] = [
  {
    "id": "kw-1",
    "name": "콴다",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 7.4,
    "downloads": 7847,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-2",
    "name": "수학",
    "classification": "primary",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 5.9,
    "downloads": 1771,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-3",
    "name": "수학문제풀이",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 1,
    "trafficScore": 5.9,
    "downloads": 1821,
    "cvr": 0,
    "sparkline": [
      1,
      1,
      1,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-4",
    "name": "콴다과외",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 5.6,
    "downloads": 1373,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-5",
    "name": "문제",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 2,
    "trafficScore": 2.9,
    "downloads": 899,
    "cvr": 0,
    "sparkline": [
      1,
      1,
      2,
      1,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-6",
    "name": "수학 문제 풀이",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 1,
    "trafficScore": 2.9,
    "downloads": 107,
    "cvr": 0,
    "sparkline": [
      1,
      1,
      1,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-7",
    "name": "답지",
    "classification": "primary",
    "currentRank": 1,
    "previousRank": 1,
    "change": 1,
    "trafficScore": 2.5,
    "downloads": 350,
    "cvr": 0,
    "sparkline": [
      1,
      1,
      1,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-8",
    "name": "콴디",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.4,
    "downloads": 683,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-9",
    "name": "qanda",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.3,
    "downloads": 619,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-10",
    "name": "콴",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.2,
    "downloads": 558,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-11",
    "name": "쾬다",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.2,
    "downloads": 558,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-12",
    "name": "콴가",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.8,
    "downloads": 367,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-13",
    "name": "quanda",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.7,
    "downloads": 163,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-14",
    "name": "콴자",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.6,
    "downloads": 299,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-15",
    "name": "qunda",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 0.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-16",
    "name": "เฉลยคณิต",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 0.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-17",
    "name": "물리 문제",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 0.5,
    "downloads": 31,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-18",
    "name": "환다",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 0.5,
    "downloads": 22,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-19",
    "name": "교육",
    "classification": "primary",
    "currentRank": 2,
    "previousRank": 1,
    "change": 3,
    "trafficScore": 3.1,
    "downloads": 132,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      3,
      3,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-20",
    "name": "photomath",
    "classification": "unclassified",
    "currentRank": 2,
    "previousRank": 2,
    "change": 0,
    "trafficScore": 3,
    "downloads": 322,
    "cvr": 0,
    "sparkline": [
      2,
      3,
      3,
      3,
      2,
      1,
      1
    ]
  },
  {
    "id": "kw-21",
    "name": "수학문제",
    "classification": "unclassified",
    "currentRank": 2,
    "previousRank": 2,
    "change": 0,
    "trafficScore": 2.8,
    "downloads": 278,
    "cvr": 0,
    "sparkline": [
      2,
      3,
      3,
      3,
      2,
      1,
      1
    ]
  },
  {
    "id": "kw-22",
    "name": "스터디큐",
    "classification": "unclassified",
    "currentRank": 2,
    "previousRank": 2,
    "change": 0,
    "trafficScore": 2.2,
    "downloads": 89,
    "cvr": 0,
    "sparkline": [
      2,
      3,
      3,
      3,
      2,
      1,
      1
    ]
  },
  {
    "id": "kw-23",
    "name": "brainly",
    "classification": "unclassified",
    "currentRank": 2,
    "previousRank": 2,
    "change": 0,
    "trafficScore": 0.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      2,
      3,
      3,
      3,
      2,
      1,
      1
    ]
  },
  {
    "id": "kw-24",
    "name": "dicamon",
    "classification": "unclassified",
    "currentRank": 2,
    "previousRank": 2,
    "change": 0,
    "trafficScore": 0.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      2,
      3,
      3,
      3,
      2,
      1,
      1
    ]
  },
  {
    "id": "kw-25",
    "name": "photo math",
    "classification": "unclassified",
    "currentRank": 2,
    "previousRank": 2,
    "change": 0,
    "trafficScore": 0.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      2,
      3,
      3,
      3,
      2,
      1,
      1
    ]
  },
  {
    "id": "kw-26",
    "name": "potomath",
    "classification": "unclassified",
    "currentRank": 2,
    "previousRank": 2,
    "change": 0,
    "trafficScore": 0.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      2,
      3,
      3,
      3,
      2,
      1,
      1
    ]
  },
  {
    "id": "kw-27",
    "name": "콴다 수학 5초 풀이 검색",
    "classification": "unclassified",
    "currentRank": 2,
    "previousRank": 2,
    "change": 0,
    "trafficScore": 0.5,
    "downloads": 232,
    "cvr": 0,
    "sparkline": [
      2,
      3,
      3,
      3,
      2,
      1,
      1
    ]
  },
  {
    "id": "kw-28",
    "name": "수학대왕",
    "classification": "unclassified",
    "currentRank": 3,
    "previousRank": 3,
    "change": 0,
    "trafficScore": 6.1,
    "downloads": 471,
    "cvr": 0,
    "sparkline": [
      3,
      4,
      4,
      4,
      3,
      2,
      2
    ]
  },
  {
    "id": "kw-29",
    "name": "문제풀이",
    "classification": "unclassified",
    "currentRank": 3,
    "previousRank": 3,
    "change": 0,
    "trafficScore": 2.3,
    "downloads": 142,
    "cvr": 0,
    "sparkline": [
      3,
      4,
      4,
      4,
      3,
      2,
      2
    ]
  },
  {
    "id": "kw-30",
    "name": "공부앱",
    "classification": "unclassified",
    "currentRank": 4,
    "previousRank": 1,
    "change": 3,
    "trafficScore": 5.5,
    "downloads": 106,
    "cvr": 0,
    "sparkline": [
      1,
      4,
      5,
      5,
      3,
      2,
      1
    ]
  },
  {
    "id": "kw-31",
    "name": "판다",
    "classification": "unclassified",
    "currentRank": 4,
    "previousRank": 4,
    "change": 0,
    "trafficScore": 4,
    "downloads": 165,
    "cvr": 0,
    "sparkline": [
      4,
      5,
      5,
      5,
      4,
      3,
      3
    ]
  },
  {
    "id": "kw-32",
    "name": "giải toán",
    "classification": "unclassified",
    "currentRank": 4,
    "previousRank": 4,
    "change": 0,
    "trafficScore": 0.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      4,
      5,
      5,
      5,
      4,
      3,
      3
    ]
  },
  {
    "id": "kw-33",
    "name": "공부",
    "classification": "primary",
    "currentRank": 6,
    "previousRank": 5,
    "change": 1,
    "trafficScore": 6.9,
    "downloads": 233,
    "cvr": 0,
    "sparkline": [
      5,
      6,
      6,
      7,
      6,
      5,
      5
    ]
  },
  {
    "id": "kw-34",
    "name": "queq",
    "classification": "unclassified",
    "currentRank": 6,
    "previousRank": 6,
    "change": 0,
    "trafficScore": 0.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      6,
      7,
      7,
      7,
      6,
      5,
      5
    ]
  },
  {
    "id": "kw-35",
    "name": "과학",
    "classification": "secondary",
    "currentRank": 7,
    "previousRank": 9,
    "change": -2,
    "trafficScore": 3.2,
    "downloads": 62,
    "cvr": 0,
    "sparkline": [
      9,
      10,
      10,
      9,
      8,
      5,
      5
    ]
  },
  {
    "id": "kw-36",
    "name": "시험",
    "classification": "primary",
    "currentRank": 7,
    "previousRank": 9,
    "change": -2,
    "trafficScore": 2.7,
    "downloads": 16,
    "cvr": 0,
    "sparkline": [
      9,
      10,
      10,
      9,
      8,
      5,
      5
    ]
  },
  {
    "id": "kw-37",
    "name": "study",
    "classification": "unclassified",
    "currentRank": 8,
    "previousRank": 4,
    "change": 4,
    "trafficScore": 4.2,
    "downloads": 49,
    "cvr": 0,
    "sparkline": [
      4,
      8,
      9,
      9,
      7,
      4,
      4
    ]
  },
  {
    "id": "kw-38",
    "name": "gauthmath",
    "classification": "unclassified",
    "currentRank": 8,
    "previousRank": 6,
    "change": 2,
    "trafficScore": 0.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      6,
      7,
      9,
      8,
      7,
      6,
      6
    ]
  },
  {
    "id": "kw-39",
    "name": "giải bài tập",
    "classification": "unclassified",
    "currentRank": 8,
    "previousRank": 8,
    "change": 0,
    "trafficScore": 0.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      8,
      9,
      9,
      9,
      8,
      7,
      7
    ]
  },
  {
    "id": "kw-40",
    "name": "math",
    "classification": "unclassified",
    "currentRank": 9,
    "previousRank": 11,
    "change": -2,
    "trafficScore": 4.3,
    "downloads": 82,
    "cvr": 0,
    "sparkline": [
      11,
      12,
      12,
      11,
      10,
      7,
      7
    ]
  },
  {
    "id": "kw-41",
    "name": "q",
    "classification": "unclassified",
    "currentRank": 9,
    "previousRank": 11,
    "change": -2,
    "trafficScore": 4.2,
    "downloads": 65,
    "cvr": 0,
    "sparkline": [
      11,
      12,
      12,
      11,
      10,
      7,
      7
    ]
  },
  {
    "id": "kw-42",
    "name": "문제집",
    "classification": "unclassified",
    "currentRank": 14,
    "previousRank": 20,
    "change": -6,
    "trafficScore": 5.2,
    "downloads": 39,
    "cvr": 0,
    "sparkline": [
      20,
      23,
      24,
      21,
      16,
      10,
      8
    ]
  },
  {
    "id": "kw-43",
    "name": "메가스터디",
    "classification": "unclassified",
    "currentRank": 22,
    "previousRank": 26,
    "change": -4,
    "trafficScore": 7.2,
    "downloads": 12,
    "cvr": 0,
    "sparkline": [
      26,
      28,
      29,
      27,
      23,
      20,
      18
    ]
  },
  {
    "id": "kw-44",
    "name": "ebs 중학",
    "classification": "unclassified",
    "currentRank": 25,
    "previousRank": 34,
    "change": -9,
    "trafficScore": 6,
    "downloads": 35,
    "cvr": 0,
    "sparkline": [
      34,
      39,
      40,
      36,
      27,
      20,
      16
    ]
  },
  {
    "id": "kw-45",
    "name": "aqua",
    "classification": "unclassified",
    "currentRank": 32,
    "previousRank": 35,
    "change": -3,
    "trafficScore": 1.8,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      35,
      37,
      37,
      36,
      33,
      31,
      29
    ]
  },
  {
    "id": "kw-46",
    "name": "数学",
    "classification": "unclassified",
    "currentRank": 35,
    "previousRank": 36,
    "change": -1,
    "trafficScore": 0.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      36,
      37,
      37,
      37,
      35,
      34,
      34
    ]
  },
  {
    "id": "kw-47",
    "name": "과외",
    "classification": "unclassified",
    "currentRank": 43,
    "previousRank": 65,
    "change": -22,
    "trafficScore": 5.8,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      65,
      77,
      80,
      69,
      49,
      30,
      21
    ]
  },
  {
    "id": "kw-48",
    "name": "앱",
    "classification": "unclassified",
    "currentRank": 47,
    "previousRank": 74,
    "change": -27,
    "trafficScore": 4.1,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      74,
      89,
      92,
      79,
      54,
      32,
      20
    ]
  }
];

const iosSuggestedKeywords: SuggestedKeyword[] = [
  {
    "id": "sg-9",
    "name": "메가스터디",
    "trafficScore": 7.2,
    "currentRank": 22,
    "category": "교육/학습",
    "isMonitored": false,
    "reason": "트래픽 7.2, 검색량 12"
  },
  {
    "id": "sg-3",
    "name": "수학대왕",
    "trafficScore": 6.1,
    "currentRank": 3,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 6.1"
  },
  {
    "id": "sg-10",
    "name": "ebs 중학",
    "trafficScore": 6,
    "currentRank": 25,
    "category": "시험/입시",
    "isMonitored": false,
    "reason": "트래픽 6, 검색량 35"
  },
  {
    "id": "sg-1",
    "name": "수학문제풀이",
    "trafficScore": 5.9,
    "currentRank": 1,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "순위 1단계 상승 중, 트래픽 5.9"
  },
  {
    "id": "sg-11",
    "name": "과외",
    "trafficScore": 5.8,
    "currentRank": 43,
    "category": "교육/학습",
    "isMonitored": false,
    "reason": "트래픽 5.8, 검색량 0"
  },
  {
    "id": "sg-4",
    "name": "공부앱",
    "trafficScore": 5.5,
    "currentRank": 4,
    "category": "교육/학습",
    "isMonitored": false,
    "reason": "순위 3단계 상승 중, 트래픽 5.5"
  },
  {
    "id": "sg-8",
    "name": "문제집",
    "trafficScore": 5.2,
    "currentRank": 14,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "트래픽 5.2, 검색량 39"
  },
  {
    "id": "sg-6",
    "name": "math",
    "trafficScore": 4.3,
    "currentRank": 9,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 4.3"
  },
  {
    "id": "sg-5",
    "name": "study",
    "trafficScore": 4.2,
    "currentRank": 8,
    "category": "교육/학습",
    "isMonitored": false,
    "reason": "순위 4단계 상승 중, 트래픽 4.2"
  },
  {
    "id": "sg-7",
    "name": "q",
    "trafficScore": 4.2,
    "currentRank": 9,
    "category": "기타",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 4.2"
  },
  {
    "id": "sg-12",
    "name": "앱",
    "trafficScore": 4.1,
    "currentRank": 47,
    "category": "앱/서비스",
    "isMonitored": false,
    "reason": "트래픽 4.1, 검색량 0"
  },
  {
    "id": "sg-2",
    "name": "photomath",
    "trafficScore": 3,
    "currentRank": 2,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 3"
  }
];

const iosWeeklyReport: WeeklyReport = {
  "period": "2026-03-11 ~ 2026-03-18",
  "generatedAt": "2026-03-18 07:00",
  "highlights": {
    "topRisers": [
      {
        "keyword": "study",
        "change": 4
      },
      {
        "keyword": "교육",
        "change": 3
      },
      {
        "keyword": "공부앱",
        "change": 3
      }
    ],
    "topFallers": [
      {
        "keyword": "앱",
        "change": -27
      },
      {
        "keyword": "과외",
        "change": -22
      },
      {
        "keyword": "ebs 중학",
        "change": -9
      }
    ]
  },
  "kpiSummary": {
    "avgRank": 7.1,
    "avgRankChange": -1.3,
    "totalDownloads": 19998,
    "totalDownloadsChange": 0,
    "avgCvr": 0,
    "avgCvrChange": 0
  },
  "asoScore": 77,
  "asoScoreTarget": 85
};

// ─── Android Data (Sensor Tower 2026-03-18) ───

const androidCollectionStatus: DataCollectionStatus[] = [
  { source: "sensor-tower", label: "Sensor Tower", status: "success", lastUpdated: "2026-03-18 02:52" },
];

const androidKeywords: Keyword[] = [
  {
    "id": "kw-1",
    "name": "콴다",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 7.8,
    "downloads": 6550,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-2",
    "name": "수학문제풀이",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 4.8,
    "downloads": 1991,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-3",
    "name": "문제",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 1,
    "trafficScore": 4.1,
    "downloads": 935,
    "cvr": 0,
    "sparkline": [
      1,
      1,
      1,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-4",
    "name": "문제풀이앱",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 4.1,
    "downloads": 745,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-5",
    "name": "문제풀이",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 3.2,
    "downloads": 781,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-6",
    "name": "콰다",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 3.1,
    "downloads": 898,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-7",
    "name": "콴디",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 3,
    "downloads": 839,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-8",
    "name": "콴",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.8,
    "downloads": 723,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-9",
    "name": "쾬다",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.8,
    "downloads": 723,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-10",
    "name": "답지",
    "classification": "primary",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.6,
    "downloads": 577,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-11",
    "name": "콴가",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.4,
    "downloads": 520,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-12",
    "name": "콴드",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.4,
    "downloads": 520,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-13",
    "name": "콴더",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.2,
    "downloads": 398,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-14",
    "name": "문제 풀이",
    "classification": "primary",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.8,
    "downloads": 211,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-15",
    "name": "콴다 선생님 수학 문제 풀어주는 과외",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.8,
    "downloads": 283,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-16",
    "name": "qanda",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.7,
    "downloads": 244,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-17",
    "name": "수학문제 풀이",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.6,
    "downloads": 174,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-18",
    "name": "콴자",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.6,
    "downloads": 213,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-19",
    "name": "수학풀이",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.4,
    "downloads": 117,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-20",
    "name": "칸다",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.3,
    "downloads": 118,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-21",
    "name": "콴타",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.3,
    "downloads": 130,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-22",
    "name": "数学解説",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 0.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      2,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-23",
    "name": "수학문제",
    "classification": "unclassified",
    "currentRank": 2,
    "previousRank": 1,
    "change": 1,
    "trafficScore": 3.9,
    "downloads": 197,
    "cvr": 0,
    "sparkline": [
      1,
      2,
      2,
      3,
      2,
      1,
      1
    ]
  },
  {
    "id": "kw-24",
    "name": "수학 문제 풀이",
    "classification": "unclassified",
    "currentRank": 2,
    "previousRank": 3,
    "change": -1,
    "trafficScore": 2.2,
    "downloads": 368,
    "cvr": 0,
    "sparkline": [
      3,
      4,
      4,
      4,
      2,
      1,
      1
    ]
  },
  {
    "id": "kw-25",
    "name": "수학대왕",
    "classification": "unclassified",
    "currentRank": 4,
    "previousRank": 1,
    "change": 7,
    "trafficScore": 5,
    "downloads": 249,
    "cvr": 0,
    "sparkline": [
      1,
      3,
      6,
      6,
      2,
      1,
      1
    ]
  },
  {
    "id": "kw-26",
    "name": "문제집 앱",
    "classification": "unclassified",
    "currentRank": 4,
    "previousRank": 4,
    "change": 0,
    "trafficScore": 4.9,
    "downloads": 45,
    "cvr": 0,
    "sparkline": [
      4,
      5,
      5,
      5,
      4,
      3,
      3
    ]
  },
  {
    "id": "kw-27",
    "name": "과외",
    "classification": "unclassified",
    "currentRank": 4,
    "previousRank": 3,
    "change": 1,
    "trafficScore": 4.8,
    "downloads": 187,
    "cvr": 0,
    "sparkline": [
      3,
      4,
      4,
      5,
      4,
      3,
      3
    ]
  },
  {
    "id": "kw-28",
    "name": "공부",
    "classification": "primary",
    "currentRank": 5,
    "previousRank": 4,
    "change": 1,
    "trafficScore": 5.7,
    "downloads": 228,
    "cvr": 0,
    "sparkline": [
      4,
      5,
      5,
      6,
      5,
      4,
      4
    ]
  },
  {
    "id": "kw-29",
    "name": "공부앱",
    "classification": "unclassified",
    "currentRank": 5,
    "previousRank": 8,
    "change": -3,
    "trafficScore": 3.6,
    "downloads": 89,
    "cvr": 0,
    "sparkline": [
      8,
      10,
      10,
      9,
      6,
      4,
      2
    ]
  },
  {
    "id": "kw-30",
    "name": "공부 앱",
    "classification": "unclassified",
    "currentRank": 5,
    "previousRank": 8,
    "change": -3,
    "trafficScore": 2.1,
    "downloads": 30,
    "cvr": 0,
    "sparkline": [
      8,
      10,
      10,
      9,
      6,
      4,
      2
    ]
  },
  {
    "id": "kw-31",
    "name": "답안지",
    "classification": "unclassified",
    "currentRank": 6,
    "previousRank": 9,
    "change": -3,
    "trafficScore": 1.8,
    "downloads": 150,
    "cvr": 0,
    "sparkline": [
      9,
      11,
      11,
      10,
      7,
      5,
      3
    ]
  },
  {
    "id": "kw-32",
    "name": "답답한",
    "classification": "unclassified",
    "currentRank": 9,
    "previousRank": 1,
    "change": 41,
    "trafficScore": 1.2,
    "downloads": 5,
    "cvr": 0,
    "sparkline": [
      1,
      4,
      23,
      17,
      1,
      1,
      1
    ]
  },
  {
    "id": "kw-33",
    "name": "답니다",
    "classification": "unclassified",
    "currentRank": 10,
    "previousRank": 1,
    "change": 17,
    "trafficScore": 1.2,
    "downloads": 28,
    "cvr": 0,
    "sparkline": [
      1,
      8,
      16,
      13,
      3,
      1,
      1
    ]
  },
  {
    "id": "kw-34",
    "name": "답",
    "classification": "unclassified",
    "currentRank": 11,
    "previousRank": 21,
    "change": -10,
    "trafficScore": 1.3,
    "downloads": 22,
    "cvr": 0,
    "sparkline": [
      21,
      26,
      28,
      23,
      13,
      5,
      1
    ]
  },
  {
    "id": "kw-35",
    "name": "ㅋ",
    "classification": "unclassified",
    "currentRank": 12,
    "previousRank": 18,
    "change": -6,
    "trafficScore": 4.9,
    "downloads": 52,
    "cvr": 0,
    "sparkline": [
      18,
      21,
      22,
      19,
      14,
      8,
      6
    ]
  },
  {
    "id": "kw-36",
    "name": "qova",
    "classification": "unclassified",
    "currentRank": 13,
    "previousRank": 1,
    "change": 14,
    "trafficScore": 6.4,
    "downloads": 80,
    "cvr": 0,
    "sparkline": [
      1,
      11,
      18,
      15,
      7,
      1,
      1
    ]
  },
  {
    "id": "kw-37",
    "name": "답다",
    "classification": "unclassified",
    "currentRank": 15,
    "previousRank": 27,
    "change": -12,
    "trafficScore": 3.4,
    "downloads": 135,
    "cvr": 0,
    "sparkline": [
      27,
      34,
      35,
      29,
      18,
      8,
      3
    ]
  },
  {
    "id": "kw-38",
    "name": "수학",
    "classification": "primary",
    "currentRank": 23,
    "previousRank": 43,
    "change": -20,
    "trafficScore": 5.4,
    "downloads": 78,
    "cvr": 0,
    "sparkline": [
      43,
      54,
      56,
      47,
      29,
      11,
      3
    ]
  },
  {
    "id": "kw-39",
    "name": "답사",
    "classification": "unclassified",
    "currentRank": 26,
    "previousRank": 27,
    "change": -1,
    "trafficScore": 2.2,
    "downloads": 15,
    "cvr": 0,
    "sparkline": [
      27,
      28,
      28,
      28,
      26,
      25,
      25
    ]
  },
  {
    "id": "kw-40",
    "name": "숙제",
    "classification": "unclassified",
    "currentRank": 37,
    "previousRank": 73,
    "change": -36,
    "trafficScore": 1.7,
    "downloads": 121,
    "cvr": 0,
    "sparkline": [
      73,
      93,
      97,
      79,
      47,
      16,
      1
    ]
  },
  {
    "id": "kw-41",
    "name": "photomath",
    "classification": "unclassified",
    "currentRank": 52,
    "previousRank": 54,
    "change": -2,
    "trafficScore": 3.3,
    "downloads": 1,
    "cvr": 0,
    "sparkline": [
      54,
      55,
      55,
      54,
      53,
      50,
      50
    ]
  },
  {
    "id": "kw-42",
    "name": "칸타타",
    "classification": "unclassified",
    "currentRank": 54,
    "previousRank": 54,
    "change": 0,
    "trafficScore": 2.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      54,
      55,
      55,
      55,
      54,
      53,
      53
    ]
  },
  {
    "id": "kw-43",
    "name": "에그릿",
    "classification": "unclassified",
    "currentRank": 55,
    "previousRank": 55,
    "change": 0,
    "trafficScore": 5.5,
    "downloads": 17,
    "cvr": 0,
    "sparkline": [
      55,
      56,
      56,
      56,
      55,
      54,
      54
    ]
  },
  {
    "id": "kw-44",
    "name": "지우다",
    "classification": "unclassified",
    "currentRank": 84,
    "previousRank": 162,
    "change": -78,
    "trafficScore": 2,
    "downloads": 1,
    "cvr": 0,
    "sparkline": [
      162,
      205,
      214,
      176,
      105,
      38,
      6
    ]
  },
  {
    "id": "kw-45",
    "name": "canada",
    "classification": "unclassified",
    "currentRank": 128,
    "previousRank": 110,
    "change": 18,
    "trafficScore": 0.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      110,
      126,
      134,
      131,
      121,
      111,
      110
    ]
  }
];

const androidSuggestedKeywords: SuggestedKeyword[] = [
  {
    "id": "sg-11",
    "name": "qova",
    "trafficScore": 6.4,
    "currentRank": 13,
    "category": "기타",
    "isMonitored": false,
    "reason": "순위 14단계 상승 중, 트래픽 6.4"
  },
  {
    "id": "sg-14",
    "name": "에그릿",
    "trafficScore": 5.5,
    "currentRank": 55,
    "category": "기타",
    "isMonitored": false,
    "reason": "트래픽 5.5, 검색량 17"
  },
  {
    "id": "sg-6",
    "name": "수학대왕",
    "trafficScore": 5,
    "currentRank": 4,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "순위 7단계 상승 중, 트래픽 5"
  },
  {
    "id": "sg-7",
    "name": "문제집 앱",
    "trafficScore": 4.9,
    "currentRank": 4,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 4.9"
  },
  {
    "id": "sg-10",
    "name": "ㅋ",
    "trafficScore": 4.9,
    "currentRank": 12,
    "category": "기타",
    "isMonitored": false,
    "reason": "트래픽 4.9, 검색량 52"
  },
  {
    "id": "sg-1",
    "name": "수학문제풀이",
    "trafficScore": 4.8,
    "currentRank": 1,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 4.8"
  },
  {
    "id": "sg-8",
    "name": "과외",
    "trafficScore": 4.8,
    "currentRank": 4,
    "category": "교육/학습",
    "isMonitored": false,
    "reason": "순위 1단계 상승 중, 트래픽 4.8"
  },
  {
    "id": "sg-2",
    "name": "문제",
    "trafficScore": 4.1,
    "currentRank": 1,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "순위 1단계 상승 중, 트래픽 4.1"
  },
  {
    "id": "sg-3",
    "name": "문제풀이앱",
    "trafficScore": 4.1,
    "currentRank": 1,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 4.1"
  },
  {
    "id": "sg-5",
    "name": "수학문제",
    "trafficScore": 3.9,
    "currentRank": 2,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "순위 1단계 상승 중, 트래픽 3.9"
  },
  {
    "id": "sg-9",
    "name": "공부앱",
    "trafficScore": 3.6,
    "currentRank": 5,
    "category": "교육/학습",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 3.6"
  },
  {
    "id": "sg-12",
    "name": "답다",
    "trafficScore": 3.4,
    "currentRank": 15,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "트래픽 3.4, 검색량 135"
  },
  {
    "id": "sg-13",
    "name": "photomath",
    "trafficScore": 3.3,
    "currentRank": 52,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "트래픽 3.3, 검색량 1"
  },
  {
    "id": "sg-4",
    "name": "문제풀이",
    "trafficScore": 3.2,
    "currentRank": 1,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 3.2"
  }
];

const androidWeeklyReport: WeeklyReport = {
  "period": "2026-03-11 ~ 2026-03-18",
  "generatedAt": "2026-03-18 07:00",
  "highlights": {
    "topRisers": [
      {
        "keyword": "답답한",
        "change": 41
      },
      {
        "keyword": "canada",
        "change": 18
      },
      {
        "keyword": "답니다",
        "change": 17
      }
    ],
    "topFallers": [
      {
        "keyword": "지우다",
        "change": -78
      },
      {
        "keyword": "숙제",
        "change": -36
      },
      {
        "keyword": "수학",
        "change": -20
      }
    ]
  },
  "kpiSummary": {
    "avgRank": 13.1,
    "avgRankChange": -1.6,
    "totalDownloads": 19788,
    "totalDownloadsChange": 0,
    "avgCvr": 0,
    "avgCvrChange": 0
  },
  "asoScore": 77,
  "asoScoreTarget": 85
};

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
