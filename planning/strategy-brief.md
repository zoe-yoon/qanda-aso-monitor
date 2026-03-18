# Strategy Brief: ASO Keyword Monitor

> **Created**: 2026-03-10
> **Author**: ASO Team
> **Status**: Draft
> **Companion**: product-brief.md

---

## Problem Analysis (Deep Dive)

### Root Cause

1. **데이터 소스 분산**: 센서타워(키워드 인텔리전스), App Store Connect(iOS 실적), Google Play Console(Android 실적)이 각각 독립 시스템으로 운영되며 통합 API/도구 부재
2. **Google Play Console API 제한**: 키워드별 SLV/SLA 데이터가 공식 API 미지원 — Android 키워드 자동화의 근본적 병목
3. **센서타워 키워드 API 불확실성**: Connect API에서 키워드 랭킹 전용 엔드포인트 공개 문서에 미확인
4. **커스텀 통합 도구 부재**: 범용 ASO 도구가 팀 고유의 키워드 분류 기준(주력/보조)과 워크플로우에 맞춘 커스텀 뷰를 제공하지 않음

### Cost of Inaction

- **시간 비용**: ASO 담당자 일 30분~1시간 × 250일/년 = 연 125~250시간 낭비
- **기회 비용**: 키워드 랭킹 하락 당일 감지 불가 → 대응 지연 → CVR 추가 하락 리스크
- **전략 비용**: 체계적 키워드 발굴 없이 경험 의존 → 롱테일 키워드 기회 상실 (현재 "롱테일 전략 부재" 지적됨)
- **경쟁 격차 확대**: ASO 점수 격차 5~9%p 유지/악화 → Organic 유입 감소 → CAC 상승

---

## Market Analysis

### Market Size

- **TAM (Total Addressable Market)**: ASO 도구 시장 전체 — 글로벌 10+ 주요 플레이어가 연 $25K~$50K+/앱 규모로 서비스 제공 (appfillip.com)
- **SAM (Serviceable Addressable Market)**: 한국 모바일 앱 퍼블리셔 중 ASO를 적극 운영하는 팀 — 센서타워 등 유료 도구 사용 기업
- **SOM (Serviceable Obtainable Market)**: 콴다 ASO 팀 내부 도구 (1개 팀, 자체 사용 목적)
- **Methodology**: 본 제품은 내부 도구이므로 시장 규모보다 내부 효율성 개선이 핵심 지표. ASO 도구 가격 데이터는 시장 벤치마크로 활용.

### Market Trends

| Trend | Relevance to Product | Direction |
|---|---|---|
| AI/ML 기반 키워드 제안 | 대부분 주요 도구가 AI 키워드 추천 도입 → 향후 AI 제안 고도화 여지 | Growing |
| 자동화 리포팅 (Slack, 이메일, BI) | 수기 → 자동 리포팅이 업계 표준화 추세 → 핵심 MVP 가치 검증 | Growing |
| 통합 대시보드 수요 | 여러 데이터 소스 → 하나의 뷰 통합 니즈 증가 → 본 제품의 핵심 방향 | Growing |
| 커스텀 데이터 파이프라인 (Snowflake, BigQuery) | 엔터프라이즈 고도화 방향 → P2 이후 고려 | Growing |
| Apple CPP 오가닉 검색 노출 | 키워드-CPP 매핑이 새로운 ASO 기법으로 부상 → 향후 모니터링 확장 | Growing |

### Market Gaps

기존 ASO 도구들은 범용 키워드 카테고리(브랜드/경쟁사/일반)만 제공하며, 팀 고유의 분류 기준을 지원하지 않음. 또한 센서타워 키워드 인텔리전스와 스토어 콘솔 실제 성과(다운로드, CVR) 교차 분석은 별도 커스텀 작업이 필요. 이 통합을 추가 비용 없이 제공하는 도구가 부재.

---

## Competition / Competitive Analysis

### Competitors

| Name | Type | Strengths | Weaknesses | Market Position | Pricing Model | Key Differentiator |
|---|---|---|---|---|---|---|
| Sensor Tower (대시보드) | Direct | 가장 포괄적 데이터, 키워드 인텔리전스 | 연 $25K-50K+ 고비용, 커스텀 분류 불가, 스토어 콘솔 미통합 | Leader | Enterprise | 데이터 커버리지 |
| AppTweak | Direct | ML 기반 추정치, 스토어 데이터 자동 익스포트 | $83-549/month 추가 비용, 팀 고유 분류 미지원 | Challenger | SaaS 월/연 | 스토어 콘솔 연동 |
| AppFollow | Direct | 리뷰 관리 강점, 무료 플랜 | 키워드 인텔리전스 약함 | Niche | Freemium | 리뷰 관리 |
| 수기 스프레드시트 | Indirect | 비용 0, 완전한 커스텀 | 수동 입력, 휴먼 에러, 시간 낭비 | 현행 | Free | 자유도 |
| Asodesk | Indirect | 모니터링 자동화, Slack 알림 | 한국 시장 커버리지 불확실 | Niche | SaaS | 알림 자동화 |

### Competitive Matrix

| Feature | ASO Keyword Monitor | Sensor Tower | AppTweak | 수기 스프레드시트 |
|---|---|---|---|---|
| 키워드 랭킹 트래킹 | ✅ (센서타워 데이터) | ✅ | ✅ | ✅ (수동) |
| 스토어 콘솔 데이터 통합 | ✅ (ASC API 자동) | ❌ | ✅ | ✅ (수동) |
| 데일리 자동 수집 | ✅ | ✅ | ✅ | ❌ |
| 주력/보조 키워드 자동 분류 | ✅ | ❌ | ❌ | ✅ (수동) |
| 기준 기반 키워드 제안 | ✅ | 부분적 | ✅ (AI) | ❌ |
| 랭킹↔다운로드↔CVR 교차 분석 | ✅ | 부분적 | ✅ | ❌ |
| 추가 비용 | $0 | $0 (기존 구독) | $83+/month | $0 |
| 커스텀 키워드 기준 | ✅ | ❌ | ❌ | ✅ (수동) |

### Opportunity Gaps

1. **팀 맞춤형 키워드 분류**: 기존 도구는 범용 카테고리만 제공. 콴다 팀의 "방어/확장" 분류 기준 지원 부재 → 커스텀 분류 체계로 차별화
2. **센서타워 + 스토어 콘솔 무료 통합**: 센서타워 키워드 데이터와 스토어 실적 교차 분석은 AppTweak 등 추가 비용 필요 → 기존 구독 + 무료 API로 통합
3. **기준 기반 키워드 제안**: 트래픽 점수 등 정량 기준 + 콴다 연관성 기반 자동 스크리닝은 범용 도구 미제공

---

## Moat & Defensibility

콴다 팀 고유의 키워드 분류 기준(주요 방어 키워드 vs 부수 확장 키워드)과 내부 ASO 전략이 녹아든 커스텀 도구. 범용 SaaS 도구로는 이 맞춤형 분류/제안 로직을 재현할 수 없음. 데이터가 축적될수록 키워드 트렌드 분석과 제안 정확도가 향상되는 데이터 우위도 형성.

---

## Success Metrics

### North Star Metric

**수기 리포팅 시간 제로화**: ASO 담당자가 매일 수기로 데이터를 입력하는 시간이 0분이 되는 것. 이 메트릭은 제품의 핵심 가치(자동화)를 직접 측정하며, 달성 시 담당자의 시간이 전략적 ASO 작업으로 전환됨.

### Primary Metrics

| Metric Name | Target Value | Measurement Method | Timeframe |
|---|---|---|---|
| 데일리 자동 수집 성공률 | 95% 이상 | GAS 실행 로그 | 구축 후 1주 |
| 모니터링 키워드 수 | 주력 10개 + 보조 20개+ | Sheets 키워드 행 수 | 구축 당일 |
| 키워드 제안 채택률 | 월 3개+ 신규 키워드 채택 | 제안→주력/보조 이동 추적 | 구축 후 1개월 |
| ASO 점수 개선 | 81% → 85% | 센서타워 ASO Score | 26Y 1Q (3월 말) |

### Secondary Metrics

| Metric Name | Target Value | Measurement Method | Timeframe |
|---|---|---|---|
| 랭킹 변동 감지→대응 시간 | 24시간 이내 | Slack 알림→액션 시간 | 구축 후 2주 |
| 데이터 정합성 | 95% 일치율 | 병행 운영 교차 검증 | 구축 후 1주 |
| PM 대시보드 조회 빈도 | 주 3회+ | Sheets 접근 로그 | 구축 후 2주 |

---

## Risks & Assumptions

### Assumptions

| Assumption | Confidence | Validation Method |
|---|---|---|
| 센서타워 API에서 키워드 랭킹 데이터 조회 가능 | Medium | 계정 로그인 후 API 문서 확인 (오늘) |
| 센서타워 API가 기존 구독에 포함 | Medium | 영업팀/계정 설정 확인 |
| App Store Connect API Key 발급 권한 있음 | High | ASC 관리자 계정 확인 |
| GAS 실행 시간(6분) 내 전체 데이터 수집 완료 | Medium | 프로토타입 실행 시간 측정 |
| ASO 팀이 Google Sheets 기반 도구 수용 | High | 기존 수기 스프레드시트 사용 중 |

### Risks

| Risk | Category | Probability | Impact | Mitigation |
|---|---|---|---|---|
| 센서타워 API에 키워드 랭킹 엔드포인트 없음 | Technical | Medium | High | 센서타워 웹 UI CSV Export → GAS 자동 파싱, 또는 Scheduled Data Feed |
| 센서타워 API 추가 비용 발생 | Financial | Medium | Medium | 영업팀 사전 확인, 불가 시 CSV Export로 우회 |
| Google Play 키워드 데이터 자동 수집 불가 | Technical | High | Medium | 센서타워 경유 수집, 스토어 콘솔은 주 1회 수동 CSV |
| GAS 실행 시간 초과 | Technical | Low | Medium | 수집을 여러 트리거로 분할 실행 |
| API 인증 키 발급 지연 | Operational | Low | High | 즉시 발급 요청, 불가 시 수동 입력으로 시작 |

---

## Timeline & Milestones

### Milestones

| Milestone | Target Date | Deliverables |
|---|---|---|
| M0: API 접근 확인 | 2026-03-10 (오전) | 센서타워 API 키워드 엔드포인트 확인, ASC API Key 발급 |
| M1: Sheets 구조 설계 | 2026-03-10 (오전) | 시트 탭 구조, 키워드 목록, 컬럼 설계 |
| M2: 데이터 수집 자동화 | 2026-03-10 (오후) | GAS 스크립트로 센서타워/ASC 데이터 자동 수집 |
| M3: 통합 뷰 + 분류 + 제안 | 2026-03-10 (오후) | 주력/보조 분류 뷰, 키워드 제안 시트, 조건부 서식 |
| M4: P1 기능 추가 | 2026-03-11~12 | Slack 알림, 경쟁사 비교, 주간 리포트 |
| M5: 안정화 & 검증 | 2026-03-13~14 | 1주 병행 운영, 데이터 정합성 검증 |

---

## Recommendations / Next Steps

- **recommended_approach**: Google Sheets + Google Apps Script 기반 MVP를 오늘 구축한다. 센서타워 API 키워드 접근이 불가할 경우 CSV Export + GAS 파싱으로 우회하고, App Store Connect Analytics API로 iOS 데이터를 자동 수집한다. Android 키워드 데이터는 센서타워 경유 + 주 1회 수동 CSV로 시작한다.

### Immediate Next Steps

1. 센서타워 계정 로그인 → API 문서에서 키워드 랭킹 엔드포인트 존재 여부 확인
2. App Store Connect에서 API Key (Issuer ID + Private Key) 발급
3. Google Sheets 생성 → 시트 탭 구조 설계 (키워드 목록, 랭킹 추이, CVR, 제안)
4. Google Apps Script로 데이터 수집 스크립트 작성 & 데일리 트리거 설정
5. 주력/보조 키워드 초기 목록 10+20개 세팅

### Open Questions

1. 센서타워 API에서 키워드 랭킹 데이터를 직접 조회할 수 있는가? (로그인 후 확인 필요)
2. 센서타워 API 사용이 기존 구독에 포함되는가, 추가 비용이 발생하는가?
3. App Store Connect API의 Rate Limit은 얼마인가?
4. Google Play Console 키워드 데이터의 장기적 자동화 방안은?

---
