// Real data from Sensor Tower — generated 2026-03-20
// Run: cd scraper && node src/generate-mockdata.js
// Source: data/st-2026-03-20.json

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

export interface DownloadSourcePoint {
  date: string;
  organicSearch: number;
  organicBrowse: number;
  paidSearch: number;
  paidDisplay: number;
  webReferral: number;
  appReferral: number;
}

// ─── Category Ranking Trend (Sensor Tower 2026-03-20) ───

export const categoryRankTrend: CategoryRankPoint[] = [
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
    "iosIpad": 42,
    "android": 19
  },
  {
    "date": "3/19",
    "fullDate": "2026-03-19",
    "iosIphone": 32,
    "iosIpad": 37,
    "android": 19
  },
  {
    "date": "3/20",
    "fullDate": "2026-03-20",
    "iosIphone": 32,
    "iosIpad": 37,
    "android": 19
  }
];

// ─── iOS Data (Sensor Tower 2026-03-20) ───

const iosCollectionStatus: DataCollectionStatus[] = [
  { source: "sensor-tower", label: "Sensor Tower", status: "success", lastUpdated: "2026-03-20 10:01" },
];

const iosKeywords: Keyword[] = [
  {
    "id": "kw-1",
    "name": "콴다",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 7.7,
    "downloads": 7812,
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
    "downloads": 1760,
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
    "change": 2,
    "trafficScore": 5.9,
    "downloads": 1889,
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
    "id": "kw-4",
    "name": "콴다과외",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 5.6,
    "downloads": 1442,
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
    "name": "qanda",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 3.9,
    "downloads": 617,
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
    "name": "문제",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 2,
    "trafficScore": 2.9,
    "downloads": 915,
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
    "id": "kw-7",
    "name": "수학 문제 풀이",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 1,
    "trafficScore": 2.9,
    "downloads": 104,
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
    "name": "수학문제",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 1,
    "trafficScore": 2.8,
    "downloads": 288,
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
    "id": "kw-9",
    "name": "콴디",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.4,
    "downloads": 682,
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
    "downloads": 557,
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
    "downloads": 557,
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
    "downloads": 169,
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
    "name": "수학대왕",
    "classification": "unclassified",
    "currentRank": 2,
    "previousRank": 2,
    "change": 0,
    "trafficScore": 6.1,
    "downloads": 471,
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
    "id": "kw-20",
    "name": "photomath",
    "classification": "unclassified",
    "currentRank": 2,
    "previousRank": 2,
    "change": 0,
    "trafficScore": 3,
    "downloads": 315,
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
    "name": "답지",
    "classification": "primary",
    "currentRank": 2,
    "previousRank": 2,
    "change": 0,
    "trafficScore": 2.5,
    "downloads": 360,
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
    "downloads": 92,
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
    "name": "판다",
    "classification": "unclassified",
    "currentRank": 3,
    "previousRank": 2,
    "change": 1,
    "trafficScore": 4,
    "downloads": 164,
    "cvr": 0,
    "sparkline": [
      2,
      3,
      3,
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
    "previousRank": 2,
    "change": 2,
    "trafficScore": 5.5,
    "downloads": 108,
    "cvr": 0,
    "sparkline": [
      2,
      3,
      5,
      4,
      3,
      2,
      2
    ]
  },
  {
    "id": "kw-31",
    "name": "교육",
    "classification": "primary",
    "currentRank": 4,
    "previousRank": 4,
    "change": 0,
    "trafficScore": 3.1,
    "downloads": 136,
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
    "downloads": 234,
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
    "previousRank": 10,
    "change": -3,
    "trafficScore": 3.2,
    "downloads": 61,
    "cvr": 0,
    "sparkline": [
      10,
      12,
      12,
      11,
      8,
      6,
      4
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
    "downloads": 14,
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
    "previousRank": 6,
    "change": 2,
    "trafficScore": 4.2,
    "downloads": 50,
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
    "id": "kw-38",
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
    "id": "kw-39",
    "name": "math",
    "classification": "unclassified",
    "currentRank": 9,
    "previousRank": 10,
    "change": -1,
    "trafficScore": 4.2,
    "downloads": 81,
    "cvr": 0,
    "sparkline": [
      10,
      11,
      11,
      11,
      9,
      8,
      8
    ]
  },
  {
    "id": "kw-40",
    "name": "q",
    "classification": "unclassified",
    "currentRank": 9,
    "previousRank": 11,
    "change": -2,
    "trafficScore": 4.2,
    "downloads": 63,
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
    "name": "gauthmath",
    "classification": "unclassified",
    "currentRank": 9,
    "previousRank": 9,
    "change": 0,
    "trafficScore": 0.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      9,
      10,
      10,
      10,
      9,
      8,
      8
    ]
  },
  {
    "id": "kw-42",
    "name": "문제집",
    "classification": "unclassified",
    "currentRank": 13,
    "previousRank": 18,
    "change": -5,
    "trafficScore": 5.2,
    "downloads": 39,
    "cvr": 0,
    "sparkline": [
      18,
      21,
      21,
      19,
      15,
      10,
      8
    ]
  },
  {
    "id": "kw-43",
    "name": "메가스터디",
    "classification": "unclassified",
    "currentRank": 16,
    "previousRank": 15,
    "change": 1,
    "trafficScore": 7.2,
    "downloads": 12,
    "cvr": 0,
    "sparkline": [
      15,
      16,
      16,
      17,
      16,
      15,
      15
    ]
  },
  {
    "id": "kw-44",
    "name": "과외",
    "classification": "unclassified",
    "currentRank": 27,
    "previousRank": 33,
    "change": -6,
    "trafficScore": 5.8,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      33,
      36,
      37,
      34,
      29,
      23,
      21
    ]
  },
  {
    "id": "kw-45",
    "name": "aqua",
    "classification": "unclassified",
    "currentRank": 32,
    "previousRank": 36,
    "change": -4,
    "trafficScore": 1.8,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      36,
      38,
      39,
      37,
      33,
      30,
      28
    ]
  },
  {
    "id": "kw-46",
    "name": "앱",
    "classification": "unclassified",
    "currentRank": 33,
    "previousRank": 48,
    "change": -15,
    "trafficScore": 4.1,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      48,
      57,
      58,
      51,
      37,
      25,
      18
    ]
  },
  {
    "id": "kw-47",
    "name": "ebs 중학",
    "classification": "unclassified",
    "currentRank": 34,
    "previousRank": 51,
    "change": -17,
    "trafficScore": 6,
    "downloads": 35,
    "cvr": 0,
    "sparkline": [
      51,
      60,
      62,
      54,
      39,
      24,
      17
    ]
  },
  {
    "id": "kw-48",
    "name": "数学",
    "classification": "unclassified",
    "currentRank": 44,
    "previousRank": 54,
    "change": -10,
    "trafficScore": 0.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      54,
      59,
      61,
      56,
      46,
      38,
      34
    ]
  }
];

const iosSuggestedKeywords: SuggestedKeyword[] = [
  {
    "id": "sg-9",
    "name": "메가스터디",
    "trafficScore": 7.2,
    "currentRank": 16,
    "category": "교육/학습",
    "isMonitored": false,
    "reason": "순위 1단계 상승 중, 트래픽 7.2"
  },
  {
    "id": "sg-2",
    "name": "수학대왕",
    "trafficScore": 6.1,
    "currentRank": 2,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 6.1"
  },
  {
    "id": "sg-12",
    "name": "ebs 중학",
    "trafficScore": 6,
    "currentRank": 34,
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
    "reason": "순위 2단계 상승 중, 트래픽 5.9"
  },
  {
    "id": "sg-10",
    "name": "과외",
    "trafficScore": 5.8,
    "currentRank": 27,
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
    "reason": "순위 2단계 상승 중, 트래픽 5.5"
  },
  {
    "id": "sg-8",
    "name": "문제집",
    "trafficScore": 5.2,
    "currentRank": 13,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "트래픽 5.2, 검색량 39"
  },
  {
    "id": "sg-5",
    "name": "study",
    "trafficScore": 4.2,
    "currentRank": 8,
    "category": "교육/학습",
    "isMonitored": false,
    "reason": "순위 2단계 상승 중, 트래픽 4.2"
  },
  {
    "id": "sg-6",
    "name": "math",
    "trafficScore": 4.2,
    "currentRank": 9,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 4.2"
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
    "id": "sg-11",
    "name": "앱",
    "trafficScore": 4.1,
    "currentRank": 33,
    "category": "앱/서비스",
    "isMonitored": false,
    "reason": "트래픽 4.1, 검색량 0"
  },
  {
    "id": "sg-3",
    "name": "photomath",
    "trafficScore": 3,
    "currentRank": 2,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 3"
  }
];

const iosWeeklyReport: WeeklyReport = {
  "period": "2026-03-13 ~ 2026-03-20",
  "generatedAt": "2026-03-20 07:00",
  "highlights": {
    "topRisers": [
      {
        "keyword": "수학문제풀이",
        "change": 2
      },
      {
        "keyword": "문제",
        "change": 2
      },
      {
        "keyword": "공부앱",
        "change": 2
      }
    ],
    "topFallers": [
      {
        "keyword": "ebs 중학",
        "change": -17
      },
      {
        "keyword": "앱",
        "change": -15
      },
      {
        "keyword": "数学",
        "change": -10
      }
    ]
  },
  "kpiSummary": {
    "avgRank": 6.7,
    "avgRankChange": -1.1,
    "totalDownloads": 20120,
    "totalDownloadsChange": 0,
    "avgCvr": 0,
    "avgCvrChange": 0
  },
  "asoScore": 78,
  "asoScoreTarget": 85
};

// ─── Android Data (Sensor Tower 2026-03-20) ───

const androidCollectionStatus: DataCollectionStatus[] = [
  { source: "sensor-tower", label: "Sensor Tower", status: "success", lastUpdated: "2026-03-20 10:01" },
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
    "downloads": 6528,
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
    "downloads": 1983,
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
    "change": 0,
    "trafficScore": 4.1,
    "downloads": 930,
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
    "id": "kw-4",
    "name": "문제풀이앱",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 4.1,
    "downloads": 746,
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
    "name": "콰다",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 3.1,
    "downloads": 890,
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
    "name": "콴디",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 3,
    "downloads": 831,
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
    "name": "콴",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.8,
    "downloads": 718,
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
    "name": "쾬다",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.8,
    "downloads": 718,
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
    "name": "답지",
    "classification": "primary",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.6,
    "downloads": 570,
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
    "name": "콴가",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.4,
    "downloads": 521,
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
    "name": "콴드",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.4,
    "downloads": 521,
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
    "name": "콴더",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 2.2,
    "downloads": 407,
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
    "name": "문제 풀이",
    "classification": "primary",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.8,
    "downloads": 214,
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
    "name": "콴다 선생님 수학 문제 풀어주는 과외",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.8,
    "downloads": 280,
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
    "name": "qanda",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.7,
    "downloads": 243,
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
    "name": "수학문제 풀이",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.6,
    "downloads": 180,
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
    "name": "콴자",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.6,
    "downloads": 214,
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
    "name": "수학풀이",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.4,
    "downloads": 121,
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
    "name": "칸다",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.3,
    "downloads": 125,
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
    "name": "콴타",
    "classification": "unclassified",
    "currentRank": 1,
    "previousRank": 1,
    "change": 0,
    "trafficScore": 1.3,
    "downloads": 133,
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
    "id": "kw-22",
    "name": "수학문제",
    "classification": "unclassified",
    "currentRank": 2,
    "previousRank": 1,
    "change": 1,
    "trafficScore": 3.9,
    "downloads": 201,
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
    "id": "kw-23",
    "name": "문제풀이",
    "classification": "unclassified",
    "currentRank": 2,
    "previousRank": 3,
    "change": -1,
    "trafficScore": 3.2,
    "downloads": 767,
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
    "id": "kw-24",
    "name": "수학 문제 풀이",
    "classification": "unclassified",
    "currentRank": 2,
    "previousRank": 3,
    "change": -1,
    "trafficScore": 2.2,
    "downloads": 360,
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
    "name": "문제집 앱",
    "classification": "unclassified",
    "currentRank": 4,
    "previousRank": 4,
    "change": 0,
    "trafficScore": 4.9,
    "downloads": 54,
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
    "id": "kw-26",
    "name": "공부",
    "classification": "primary",
    "currentRank": 5,
    "previousRank": 4,
    "change": 1,
    "trafficScore": 5.7,
    "downloads": 226,
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
    "id": "kw-27",
    "name": "공부앱",
    "classification": "unclassified",
    "currentRank": 5,
    "previousRank": 8,
    "change": -3,
    "trafficScore": 3.6,
    "downloads": 81,
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
    "id": "kw-28",
    "name": "공부 앱",
    "classification": "unclassified",
    "currentRank": 5,
    "previousRank": 8,
    "change": -3,
    "trafficScore": 2.1,
    "downloads": 28,
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
    "id": "kw-29",
    "name": "답안지",
    "classification": "unclassified",
    "currentRank": 6,
    "previousRank": 10,
    "change": -4,
    "trafficScore": 1.8,
    "downloads": 148,
    "cvr": 0,
    "sparkline": [
      10,
      12,
      13,
      11,
      7,
      4,
      2
    ]
  },
  {
    "id": "kw-30",
    "name": "답답한",
    "classification": "unclassified",
    "currentRank": 9,
    "previousRank": 3,
    "change": 6,
    "trafficScore": 1.2,
    "downloads": 5,
    "cvr": 0,
    "sparkline": [
      3,
      8,
      11,
      10,
      7,
      3,
      3
    ]
  },
  {
    "id": "kw-31",
    "name": "ㅋ",
    "classification": "unclassified",
    "currentRank": 10,
    "previousRank": 13,
    "change": -3,
    "trafficScore": 4.9,
    "downloads": 53,
    "cvr": 0,
    "sparkline": [
      13,
      15,
      15,
      14,
      11,
      9,
      7
    ]
  },
  {
    "id": "kw-32",
    "name": "답",
    "classification": "unclassified",
    "currentRank": 10,
    "previousRank": 17,
    "change": -7,
    "trafficScore": 1.3,
    "downloads": 21,
    "cvr": 0,
    "sparkline": [
      17,
      21,
      22,
      19,
      12,
      6,
      3
    ]
  },
  {
    "id": "kw-33",
    "name": "답니다",
    "classification": "unclassified",
    "currentRank": 10,
    "previousRank": 11,
    "change": -1,
    "trafficScore": 1.2,
    "downloads": 28,
    "cvr": 0,
    "sparkline": [
      11,
      12,
      12,
      12,
      10,
      9,
      9
    ]
  },
  {
    "id": "kw-34",
    "name": "qova",
    "classification": "unclassified",
    "currentRank": 13,
    "previousRank": 7,
    "change": 6,
    "trafficScore": 6.4,
    "downloads": 82,
    "cvr": 0,
    "sparkline": [
      7,
      12,
      15,
      14,
      11,
      7,
      7
    ]
  },
  {
    "id": "kw-35",
    "name": "답다",
    "classification": "unclassified",
    "currentRank": 17,
    "previousRank": 32,
    "change": -15,
    "trafficScore": 3.4,
    "downloads": 128,
    "cvr": 0,
    "sparkline": [
      32,
      41,
      42,
      35,
      21,
      9,
      2
    ]
  },
  {
    "id": "kw-36",
    "name": "수학",
    "classification": "primary",
    "currentRank": 24,
    "previousRank": 45,
    "change": -21,
    "trafficScore": 5.4,
    "downloads": 68,
    "cvr": 0,
    "sparkline": [
      45,
      57,
      59,
      49,
      30,
      12,
      3
    ]
  },
  {
    "id": "kw-37",
    "name": "과외",
    "classification": "unclassified",
    "currentRank": 27,
    "previousRank": 49,
    "change": -22,
    "trafficScore": 4.8,
    "downloads": 188,
    "cvr": 0,
    "sparkline": [
      49,
      61,
      64,
      53,
      33,
      14,
      5
    ]
  },
  {
    "id": "kw-38",
    "name": "답사",
    "classification": "unclassified",
    "currentRank": 27,
    "previousRank": 49,
    "change": -22,
    "trafficScore": 2.2,
    "downloads": 14,
    "cvr": 0,
    "sparkline": [
      49,
      61,
      64,
      53,
      33,
      14,
      5
    ]
  },
  {
    "id": "kw-39",
    "name": "수학대왕",
    "classification": "unclassified",
    "currentRank": 45,
    "previousRank": 79,
    "change": -34,
    "trafficScore": 5,
    "downloads": 253,
    "cvr": 0,
    "sparkline": [
      79,
      97,
      102,
      85,
      54,
      25,
      11
    ]
  },
  {
    "id": "kw-40",
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
    "id": "kw-41",
    "name": "에그릿",
    "classification": "unclassified",
    "currentRank": 60,
    "previousRank": 60,
    "change": 0,
    "trafficScore": 5.5,
    "downloads": 17,
    "cvr": 0,
    "sparkline": [
      60,
      61,
      61,
      61,
      60,
      59,
      59
    ]
  },
  {
    "id": "kw-42",
    "name": "photomath",
    "classification": "unclassified",
    "currentRank": 62,
    "previousRank": 75,
    "change": -13,
    "trafficScore": 3.3,
    "downloads": 1,
    "cvr": 0,
    "sparkline": [
      75,
      82,
      84,
      78,
      65,
      54,
      49
    ]
  },
  {
    "id": "kw-43",
    "name": "지우다",
    "classification": "unclassified",
    "currentRank": 82,
    "previousRank": 158,
    "change": -76,
    "trafficScore": 2,
    "downloads": 1,
    "cvr": 0,
    "sparkline": [
      158,
      200,
      209,
      171,
      103,
      37,
      6
    ]
  },
  {
    "id": "kw-44",
    "name": "숙제",
    "classification": "unclassified",
    "currentRank": 89,
    "previousRank": 177,
    "change": -88,
    "trafficScore": 1.7,
    "downloads": 114,
    "cvr": 0,
    "sparkline": [
      177,
      225,
      236,
      192,
      113,
      37,
      1
    ]
  },
  {
    "id": "kw-45",
    "name": "canada",
    "classification": "unclassified",
    "currentRank": 124,
    "previousRank": 105,
    "change": 19,
    "trafficScore": 0.5,
    "downloads": 0,
    "cvr": 0,
    "sparkline": [
      105,
      122,
      130,
      128,
      117,
      107,
      105
    ]
  }
];

const androidSuggestedKeywords: SuggestedKeyword[] = [
  {
    "id": "sg-9",
    "name": "qova",
    "trafficScore": 6.4,
    "currentRank": 13,
    "category": "기타",
    "isMonitored": false,
    "reason": "순위 6단계 상승 중, 트래픽 6.4"
  },
  {
    "id": "sg-13",
    "name": "에그릿",
    "trafficScore": 5.5,
    "currentRank": 60,
    "category": "기타",
    "isMonitored": false,
    "reason": "트래픽 5.5, 검색량 17"
  },
  {
    "id": "sg-12",
    "name": "수학대왕",
    "trafficScore": 5,
    "currentRank": 45,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "트래픽 5, 검색량 253"
  },
  {
    "id": "sg-6",
    "name": "문제집 앱",
    "trafficScore": 4.9,
    "currentRank": 4,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 4.9"
  },
  {
    "id": "sg-8",
    "name": "ㅋ",
    "trafficScore": 4.9,
    "currentRank": 10,
    "category": "기타",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 4.9"
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
    "id": "sg-11",
    "name": "과외",
    "trafficScore": 4.8,
    "currentRank": 27,
    "category": "교육/학습",
    "isMonitored": false,
    "reason": "트래픽 4.8, 검색량 188"
  },
  {
    "id": "sg-2",
    "name": "문제",
    "trafficScore": 4.1,
    "currentRank": 1,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 4.1"
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
    "id": "sg-4",
    "name": "수학문제",
    "trafficScore": 3.9,
    "currentRank": 2,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "순위 1단계 상승 중, 트래픽 3.9"
  },
  {
    "id": "sg-7",
    "name": "공부앱",
    "trafficScore": 3.6,
    "currentRank": 5,
    "category": "교육/학습",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 3.6"
  },
  {
    "id": "sg-10",
    "name": "답다",
    "trafficScore": 3.4,
    "currentRank": 17,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "트래픽 3.4, 검색량 128"
  },
  {
    "id": "sg-14",
    "name": "photomath",
    "trafficScore": 3.3,
    "currentRank": 62,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "트래픽 3.3, 검색량 1"
  },
  {
    "id": "sg-5",
    "name": "문제풀이",
    "trafficScore": 3.2,
    "currentRank": 2,
    "category": "수학/풀이",
    "isMonitored": false,
    "reason": "Top 10 유지 중, 트래픽 3.2"
  }
];

const androidWeeklyReport: WeeklyReport = {
  "period": "2026-03-13 ~ 2026-03-20",
  "generatedAt": "2026-03-20 07:00",
  "highlights": {
    "topRisers": [
      {
        "keyword": "canada",
        "change": 19
      },
      {
        "keyword": "답답한",
        "change": 6
      },
      {
        "keyword": "qova",
        "change": 6
      }
    ],
    "topFallers": [
      {
        "keyword": "숙제",
        "change": -88
      },
      {
        "keyword": "지우다",
        "change": -76
      },
      {
        "keyword": "수학대왕",
        "change": -34
      }
    ]
  },
  "kpiSummary": {
    "avgRank": 15.9,
    "avgRankChange": -6.2,
    "totalDownloads": 19711,
    "totalDownloadsChange": 0,
    "avgCvr": 0,
    "avgCvrChange": 0
  },
  "asoScore": 68,
  "asoScoreTarget": 85
};

// ─── Download Sources Mock Data (30일) ───
// 실제 데이터가 Google Sheets에 쌓이면 이 mock은 fallback으로만 사용됨

function generateMockDownloadSources(os: "ios" | "android"): DownloadSourcePoint[] {
  const result: DownloadSourcePoint[] = [];
  // iOS는 검색 비중 높고, Android는 브라우징 비중 높은 패턴
  const base = os === "ios"
    ? { organicSearch: 520, organicBrowse: 280, paidSearch: 120, paidDisplay: 80, webReferral: 90, appReferral: 60 }
    : { organicSearch: 350, organicBrowse: 220, paidSearch: 80, paidDisplay: 70, webReferral: 65, appReferral: 45 };

  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const date = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();
    const wf = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.75 : 1;
    const r = () => (Math.random() - 0.5) * 40;

    result.push({
      date,
      organicSearch: Math.max(0, Math.round((base.organicSearch + Math.sin(i * 0.3) * 50 + r()) * wf)),
      organicBrowse: Math.max(0, Math.round((base.organicBrowse + Math.sin(i * 0.4) * 30 + r()) * wf)),
      paidSearch: Math.max(0, Math.round((base.paidSearch + Math.cos(i * 0.35) * 25 + r()) * wf)),
      paidDisplay: Math.max(0, Math.round((base.paidDisplay + Math.cos(i * 0.5) * 20 + r()) * wf)),
      webReferral: Math.max(0, Math.round((base.webReferral + Math.sin(i * 0.5) * 15 + r()) * wf)),
      appReferral: Math.max(0, Math.round((base.appReferral + Math.cos(i * 0.3) * 10 + r()) * wf)),
    });
  }
  return result;
}

const iosDownloadSources = generateMockDownloadSources("ios");
const androidDownloadSources = generateMockDownloadSources("android");

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

export function getDownloadSourceData(os: OS): DownloadSourcePoint[] {
  return os === "ios" ? iosDownloadSources : androidDownloadSources;
}

// Legacy exports
export const collectionStatus = iosCollectionStatus;
export const keywords = iosKeywords;
export const suggestedKeywords = iosSuggestedKeywords;
export const weeklyReport = iosWeeklyReport;
