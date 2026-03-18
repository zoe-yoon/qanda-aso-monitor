# Research Context: Domain Research

> **Type**: Domain
> **Created**: 2026-03-10
> **Sources**: 14 web sources cited

---

## Executive Summary

ASO 키워드 & 앱 랭킹 데일리 모니터링 대시보드 구축을 위한 기술 도메인 리서치 결과, 세 가지 핵심 데이터 소스(Sensor Tower API, App Store Connect API, Google Play Console)의 접근 방식과 제약 사항이 명확해졌다.

**Sensor Tower**는 Connect API를 통해 다운로드/매출 추정치, 카테고리 랭킹 등을 제공하지만, 키워드 랭킹 전용 API 엔드포인트는 공개 문서에서 확인이 제한적이다. 인증은 토큰 기반이며, 기존 구독에 API 접근이 포함되는지 확인이 필요하다.

**App Store Connect API**는 v3.4(2024년 발표)부터 Analytics Reports API를 제공하여 임프레션, 다운로드, 제품 페이지 뷰 등 50개 이상의 리포트를 프로그래매틱하게 다운로드할 수 있다. JWT 인증 기반이며, TSV 형식의 데일리/위클리/먼슬리 데이터를 받을 수 있다.

**Google Play Console**은 공식 Reporting API를 통해 앱 품질 데이터(크래시, ANR 등)를 제공하지만, 키워드별 다운로드/임프레션 데이터는 콘솔 UI에서만 확인 가능하며 프로그래매틱 접근이 제한적이다. 키워드 성과 데이터는 서드파티 도구나 수동 익스포트에 의존해야 한다.

데일리 자동 수집은 Python 스크립트 + cron job 또는 Google Apps Script로 구현 가능하며, 수집된 데이터를 Google Sheets 또는 간단한 대시보드에 적재하는 파이프라인이 현실적인 MVP 접근법이다.

---

## Key Findings

### Finding 1: Sensor Tower Connect API — 데이터 전달 옵션 다양하나 키워드 API 접근 제한적

- **Source**: https://sensortower.com/product/connect
- **Insight**: Sensor Tower Connect는 API, 스케줄 데이터 피드(CSV/Parquet), 커스텀 알림 3가지 방식으로 데이터 제공. Snowflake, Salesforce, Slack과 직접 연동 가능. 그러나 sensortowerR 패키지 분석 결과, 공개된 API에는 `st_category_rankings()`, `st_sales_report()`, `st_app_info()` 등은 있으나 키워드 랭킹 전용 함수는 없음.
- **Relevance**: 키워드 랭킹 데이터는 Sensor Tower 웹 UI에서 수동 확인하거나, Connect API의 미공개 엔드포인트를 사용해야 할 수 있음. 영업팀에 키워드 API 포함 여부 확인 필요.

### Finding 2: App Store Connect Analytics API — 프로그래매틱 접근 완전 지원

- **Source**: https://developer.apple.com/documentation/AppStoreConnectAPI/downloading-analytics-reports
- **Insight**: App Store Connect API v3.4+에서 50개 이상의 분석 리포트를 프로그래매틱으로 다운로드 가능. POST `/v1/analyticsReportRequests`로 리포트 요청 후, Ongoing(데일리 연속) 또는 One-time snapshot(히스토리컬) 방식으로 데이터 수신. TSV 형식의 압축 파일로 제공되며, 임프레션/다운로드/제품 페이지 뷰/매출 등의 메트릭 포함.
- **Relevance**: iOS 앱의 다운로드, 임프레션, CVR 데이터를 자동 수집하는 핵심 경로. JWT 인증 설정 후 Python/Swift 스크립트로 자동화 가능.

### Finding 3: Google Play Console — 키워드 데이터 프로그래매틱 접근 제한

- **Source**: https://developers.google.com/play/developer/reporting
- **Insight**: Google Play Developer Reporting API는 앱 품질 데이터(크래시율, ANR율 등)에 초점. 키워드별 Store Listing Visitors(SLV), Store Listing Acquisitions(SLA) 데이터는 콘솔 UI의 "Organic Search" 탭에서만 확인 가능하며, 공식 API로 프로그래매틱 접근이 불가능. 구(Old) Play Console에서는 Google Cloud Storage를 통한 일부 리포트 익스포트가 가능했으나, 신(New) Console에서는 지원하지 않음.
- **Relevance**: Android 키워드 성과 데이터는 센서타워를 통해 간접 수집하거나, Play Console에서 수동 CSV 익스포트에 의존해야 함. 이 제약이 완전 자동화의 가장 큰 병목.

### Finding 4: 데일리 자동 수집 — Python + cron 또는 GAS가 현실적 방법

- **Source**: https://www.scrapingdog.com/blog/python-rank-tracker/
- **Insight**: Python 스크립트로 API 호출 → 데이터 파싱 → Google Sheets/DB 적재를 자동화하고, cron job으로 데일리 스케줄링하는 것이 일반적 패턴. Google Apps Script는 Google Sheets와 직접 연동되어 추가 인프라 없이 자동화 가능하지만, 외부 API 호출에 제한(실행 시간 6분, 일일 호출 제한)이 있음.
- **Relevance**: MVP에서는 Google Apps Script로 시작하고, 스케일 필요 시 Python + 클라우드 함수(AWS Lambda, GCP Cloud Functions)로 전환하는 단계적 접근이 적합.

### Finding 5: ASO 키워드 트래킹 대시보드 — 핵심 메트릭과 시각화 방법

- **Source**: https://sensortower.com/blog/how-to-track-where-your-app-ranks-for-all-of-its-keywords
- **Insight**: 효과적인 ASO 모니터링 대시보드의 핵심 요소: (1) 키워드별 랭킹 추이 차트, (2) 키워드별 트래픽 점수/검색량, (3) 다운로드-임프레션-CVR 퍼널, (4) 경쟁사 대비 순위, (5) 랭킹 변동 알림(상승/하락). 데이터 갱신은 최소 1일 1회, 가능하면 하루 수회가 권장됨.
- **Relevance**: 대시보드 설계 시 이 5가지 요소를 핵심 뷰로 구성. 기존 Google Spreadsheet 기반에서 시작하여 점진적으로 Looker Studio 등으로 고도화 가능.

---

## Detailed Analysis

### Technology Landscape

#### 1. Sensor Tower API

| 항목 | 상세 |
|---|---|
| 인증 | Token 기반 (Sensor Tower Web UI에서 토큰 발급: sensortower.com/users/edit) |
| 데이터 형식 | JSON (API), CSV/Parquet (Scheduled Feeds) |
| 주요 엔드포인트 | `get_category_rankings`, `get_download_estimates`, `get_revenue_estimates`, `search_entities` |
| 키워드 관련 | 공개 문서에서 키워드 랭킹 전용 API 미확인 — 별도 문의 필요 |
| 연동 방식 | REST API, Snowflake 직접 연동, Scheduled Data Feed |
| 데이터 갱신 | 일별 |

#### 2. App Store Connect API

| 항목 | 상세 |
|---|---|
| 인증 | JWT (Issuer ID + Private Key ID + Private Key) |
| API 버전 | v3.4+ (Analytics Reports 지원) |
| 주요 엔드포인트 | POST `/v1/analyticsReportRequests` → 리포트 생성, GET 리포트 인스턴스 → 세그먼트 다운로드 |
| 사용 가능 메트릭 | 임프레션, 제품 페이지 뷰, 다운로드(최초/재설치), 매출, 활성 기기, 크래시, 삭제 |
| 리포트 카테고리 | App Store Engagement, Commerce, App Usage, Frameworks Usage, Performance |
| 데이터 형식 | TSV (압축 아카이브) |
| 필터링 | 국가, 기기 유형, 앱 버전 등 |
| 데이터 갱신 | Ongoing(데일리 연속) 또는 One-time Snapshot |

#### 3. Google Play Console

| 항목 | 상세 |
|---|---|
| 공식 API | Play Developer Reporting API — 크래시/ANR 등 품질 데이터 중심 |
| 키워드 데이터 | 콘솔 UI에서만 확인 가능 (SLV, SLA per keyword) |
| 프로그래매틱 접근 | 키워드 데이터는 불가, 구 콘솔에서 GCS 익스포트 일부 지원(신 콘솔 미지원) |
| 대안 | 센서타워/서드파티 도구 API, 수동 CSV 익스포트, AppTweak Automated Exports |

### Architecture Patterns

#### 추천 아키텍처: MVP (오늘 구축 가능)

```
[Sensor Tower API] ──→ [Python Script / GAS] ──→ [Google Sheets]
[App Store Connect API] ──→ [Python Script / GAS] ──→ [Google Sheets]
[Google Play Console] ──→ [수동 CSV 또는 센서타워] ──→ [Google Sheets]
                                                          ↓
                                                   [Looker Studio] (선택)
                                                          ↓
                                                   [Slack 알림] (선택)
```

#### 추천 아키텍처: 고도화 버전

```
[Sensor Tower Connect] ──→ [Snowflake / BigQuery] ──→ [Looker Studio / Metabase]
[App Store Connect API] ──→ [Cloud Function] ──→ [BigQuery]
[Google Play Console]   ──→ [AppTweak Export] ──→ [BigQuery]
                                                       ↓
                                                  [Slack Bot 알림]
                                                  [이메일 데일리 리포트]
```

### Integration Options

| 방식 | 장점 | 단점 | MVP 적합도 |
|---|---|---|---|
| Google Apps Script | 인프라 불필요, Google Sheets 직접 연동 | 실행시간 6분 제한, API 호출 제한 | ⭐⭐⭐ |
| Python + cron (로컬) | 유연성 높음, 제한 없음 | 서버/PC 항상 켜져야 함 | ⭐⭐ |
| Python + Cloud Functions | 서버리스, 안정적 | 초기 설정 필요 | ⭐⭐ |
| AppTweak Automated Exports | 코딩 불필요, 스토어 데이터 통합 | 추가 비용($83+/month) | ⭐⭐ |
| Sensor Tower Scheduled Feed | 공식 지원, CSV/Parquet | 엔터프라이즈 플랜 필요 가능성 | ⭐ |

### Technical Risks & Challenges

1. **센서타워 키워드 API 불확실성**: 공개 문서에 키워드 랭킹 전용 API가 명시되어 있지 않아, 실제 사용 가능 여부는 계정 접근 후 확인 필요
2. **Google Play 키워드 데이터 자동화 불가**: 공식 API가 키워드 성과 데이터를 제공하지 않아 완전 자동화에 한계
3. **API 비용**: 센서타워 Connect API가 기존 구독에 포함되지 않을 경우 추가 비용 발생 가능
4. **데이터 정합성**: 센서타워 추정치와 스토어 콘솔 실제 데이터 간 차이 존재 가능

---

## Data Points

| Data Point | Value | Source | Confidence |
|---|---|---|---|
| App Store Connect API Analytics 리포트 수 | 50+ 종류 | developer.apple.com | High |
| App Store Connect API 버전 (Analytics 지원) | v3.4+ | easyappreports.com | High |
| Google Apps Script 실행 시간 제한 | 6분 | Google 공식 문서 | High |
| Sensor Tower 인증 방식 | Token (웹 UI에서 발급) | apitracker.io | Medium |
| Google Play Reporting API 데이터 범위 | 크래시, ANR 등 품질 데이터 중심 | developers.google.com | High |
| Google Play Console 키워드 데이터 API 접근 | 불가 (UI only) | support.google.com | High |
| sensortowerR 패키지 키워드 함수 | 미제공 | cran.r-project.org | High |

---

## Implications for Product

### Must-Address

- **센서타워 키워드 API 확인**: 오늘 센서타워 계정으로 로그인하여 API 문서(sensortower.com/api/v1/index.html)에서 키워드 랭킹 엔드포인트 존재 여부 확인 필수
- **App Store Connect API Key 발급**: JWT 인증에 필요한 Issuer ID, Private Key ID, Private Key를 App Store Connect에서 생성해야 함
- **Google Play 키워드 데이터 대안 마련**: 공식 API 미지원이므로 (a) 센서타워 데이터 활용, (b) 수동 CSV 익스포트, (c) 서드파티 도구 중 택일

### Should-Consider

- MVP는 Google Sheets + Google Apps Script 조합으로 시작하여 인프라 비용 제로로 구축
- App Store Connect API의 Ongoing 리포트로 iOS 데이터 자동 수집 파이프라인 우선 구축
- 센서타워 Scheduled Data Feed(CSV)를 Google Sheets에 자동 임포트하는 방식도 고려
- Slack Webhook으로 키워드 랭킹 변동 알림 자동화

### Nice-to-Know

- 2025년부터 Apple Custom Product Pages(CPP)가 오가닉 검색에도 노출되어 키워드-CPP 매핑 전략이 새로운 ASO 기법으로 부상
- Sensor Tower MCP Server (LobeHub)가 존재하여 LLM 기반 분석 자동화 가능성도 열려 있음
- AppTweak의 Automated Exports는 7일 무료 체험으로 검증 후 도입 결정 가능

---

## Gaps & Limitations

- 센서타워 API의 정확한 키워드 관련 엔드포인트는 로그인 후 내부 문서에서만 확인 가능 (공개 미공개)
- Google Play Console의 키워드 성과 데이터 프로그래매틱 접근 방법이 공식적으로 없어, 이 영역의 자동화는 근본적 한계 존재
- App Store Connect API의 구체적인 Rate Limit은 공개 문서에서 확인되지 않음
- 실제 센서타워 API 호출 비용(기존 구독 포함 여부)은 영업팀 확인 필요

---

## Sources

| # | Title | URL | Date Accessed |
|---|---|---|---|
| 1 | Sensor Tower Connect - API & Data Feeds | https://sensortower.com/product/connect | 2026-03-10 |
| 2 | Sensor Tower API - Docs & Integration | https://apitracker.io/a/sensor-tower | 2026-03-10 |
| 3 | sensortowerR - CRAN R Package Reference | https://cran.r-project.org/web/packages/sensortowerR/refman/sensortowerR.html | 2026-03-10 |
| 4 | Play Developer Reporting API | https://developers.google.com/play/developer/reporting | 2026-03-10 |
| 5 | Google Play Console - Understand User Base | https://support.google.com/googleplay/android-developer/answer/9859173 | 2026-03-10 |
| 6 | Google Play Console - App Statistics | https://support.google.com/googleplay/android-developer/answer/139628 | 2026-03-10 |
| 7 | App Store Connect Analytics | https://developer.apple.com/app-store-connect/analytics/ | 2026-03-10 |
| 8 | Downloading Analytics Reports - Apple Developer Docs | https://developer.apple.com/documentation/AppStoreConnectAPI/downloading-analytics-reports | 2026-03-10 |
| 9 | Analytics Reports API - polpiella.dev | https://www.polpiella.dev/analytics-reports-api-app-store-connect | 2026-03-10 |
| 10 | App Store Connect API Overview | https://developer.apple.com/app-store-connect/api/ | 2026-03-10 |
| 11 | New App Store Analytics API - easyappreports.com | https://www.easyappreports.com/blog/app-store-analytics-api-what-is-it-why-you-should-be-excited-and-how-to-be-ready-for-its-launch | 2026-03-10 |
| 12 | Export Store Data via API - AppTweak | https://www.apptweak.com/en/aso-blog/export-app-store-connect-and-google-play-console-data-by-api | 2026-03-10 |
| 13 | Sensor Tower Keyword Overview Feature | https://sensortower.com/blog/keyword-overview-feature | 2026-03-10 |
| 14 | Python Rank Tracker - ScrapingDog | https://www.scrapingdog.com/blog/python-rank-tracker/ | 2026-03-10 |

---
