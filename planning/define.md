# Product Definition: ASO Keyword Monitor

> **Created**: 2026-03-10
> **Phase**: 3 - Define

---

## Problem Statement

### Current Situation

콴다 ASO 팀은 센서타워, App Store Connect, Google Play Console 등 3개 이상의 데이터 소스를 매일 수동으로 확인하고 Google Spreadsheet에 수기 입력하여 키워드 랭킹, 다운로드 수, CVR을 리포팅하고 있다. ASO 도구 시장 리서치에 따르면, "많은 ASO 팀이 키워드 선정, 메타데이터 최적화, 성과 리포팅에서 여전히 수동 프로세스를 유지"하고 있어 이는 업계 공통의 문제이다 (asodesk.com).

현재 콴다의 ASO 점수는 81%로, 경쟁 앱(말해보카, 스픽, 듀오링고)의 85~90% 대비 5~9%p 격차가 있으며, 브랜드 키워드 의존도가 85% 이상으로 Generic 키워드를 통한 신규 유저 유입이 거의 없는 상태다.

### Pain Points

| Pain Point | Affected Users | Severity (1-5) |
|---|---|---|
| 매일 3개+ 데이터 소스를 수동 확인/입력 → 30분~1시간 소요 | ASO/마케팅 담당자 (2-3명) | 5 |
| 키워드 랭킹 변동을 당일에 감지하지 못함 (다음날 수기 확인 시 발견) | ASO 담당자 | 4 |
| 주력/보조 키워드 발굴이 체계적이지 않음 — 경험 기반 수동 선정 | ASO 담당자 | 4 |
| 데이터 분산으로 통합 트렌드 분석 불가 (랭킹↔다운로드↔CVR 교차 분석 어려움) | ASO 담당자, PM | 4 |
| 다국가 ASO 데이터(KR/US/JP/TW/TH) 통합 관리 불가 | ASO 담당자 | 3 |

### Root Cause Analysis

1. **데이터 소스 분산**: 센서타워(키워드 인텔리전스), App Store Connect(iOS 실적), Google Play Console(Android 실적)이 각각 독립된 시스템으로 운영되며, 이를 통합하는 공식 API/도구가 존재하지 않음
2. **Google Play Console API 제한**: 키워드별 SLV/SLA 데이터가 공식 API로 제공되지 않아 프로그래매틱 접근 불가 — Android 키워드 자동화의 근본적 병목
3. **센서타워 키워드 API 불확실성**: 센서타워 Connect API에서 키워드 랭킹 전용 엔드포인트가 공개 문서에 미확인 — 별도 확인 필요
4. **커스텀 통합 도구 부재**: 기존 ASO 도구(AppTweak, AppFollow 등)는 자체 대시보드를 제공하지만, 팀 고유의 키워드 분류 기준(주력/보조)과 모니터링 워크플로우에 맞춘 커스텀 뷰가 없음

### Cost of Inaction

- **시간 비용**: ASO 담당자 일 30분~1시간 × 250일/년 = 연 125~250시간 낭비
- **기회 비용**: 키워드 랭킹 하락을 당일 감지하지 못해 대응 지연 → CVR 추가 하락 리스크
- **전략 비용**: 체계적 키워드 발굴 없이 경험 의존 → 롱테일 키워드 기회 지속 상실 (현재 PRD에서 "롱테일 전략 부재" 지적)
- **경쟁 격차 확대**: 경쟁 앱 대비 ASO 점수 격차(5~9%p) 유지/악화 → Organic 유입 감소 → CAC 상승

---

## Target Audience

### Primary Users

| Persona Name | Demographics | Goals | Frustrations | Tech Proficiency |
|---|---|---|---|---|
| 민지 (ASO 매니저) | 20대 후반, 모바일 앱 마케팅 3년차, 콴다 마케팅팀 | 키워드 랭킹 변동 즉시 감지, 주력/보조 키워드 성과 추적, ASO 점수 85% 달성 | 매일 센서타워+스토어 콘솔 3곳 돌아다니며 수기 입력, 트렌드 변화 놓침 | High |
| 준호 (ASO 실무자) | 20대 중반, 마케팅 1-2년차, 키워드 리서치 및 리스팅 최적화 담당 | 신규 키워드 발굴, 경쟁사 키워드 벤치마크, 다국가 키워드 관리 | 키워드 선정 기준이 체계적이지 않음, 데이터 기반 의사결정 어려움 | Medium-High |

### Secondary Users

| Persona Name | Demographics | Goals | Frustrations | Tech Proficiency |
|---|---|---|---|---|
| 재현 (PM/팀 리더) | 30대 초반, 제품 조직 리더, ASO Epic 오너 | ASO 성과 한눈에 확인, CAC 10% 절감 목표 추적, 주간/월간 리포트 수령 | 현황 파악 위해 담당자에게 매번 요청 필요, 통합 대시보드 부재 | Medium |

### Stakeholders

| Role | Interests | Influence Level |
|---|---|---|
| 마케팅 헤드 | CAC 절감 목표 달성, ROI 가시화 | High |
| 제품 조직 리더 | ASO Epic(QANC-2159) 진행 상황, ASO 점수 개선 | High |
| 엔지니어링 | API 연동 기술 지원, 자동화 인프라 | Medium |

---

## Core Value Proposition

- **Unique Value**: 센서타워 + 스토어 콘솔 데이터를 하나의 시트/대시보드에 자동 통합하고, 콴다 고유의 키워드 분류 기준(주력 방어 키워드 / 부수 확장 키워드)에 맞춘 모니터링과 키워드 제안을 제공하는 내부 전용 도구. 기존 ASO 도구가 제공하지 않는 "팀 맞춤형 키워드 분류 + 데일리 자동 트래킹 + 제안" 을 하나로 묶음.

- **Positioning Statement**: ASO 키워드 랭킹과 앱 성과를 매일 수기로 관리하는 콴다 마케팅팀을 위해, ASO Keyword Monitor는 센서타워와 스토어 데이터를 자동 수집하여 키워드 랭킹/다운로드/CVR을 통합 모니터링하는 내부 대시보드이다. 기존 수기 스프레드시트와 달리, 데일리 자동 업데이트와 주력/보조 키워드 기준에 맞춘 제안 기능을 제공한다.

- **Moat**: 콴다 팀 고유의 키워드 분류 기준(방어 vs 확장)과 내부 ASO 전략이 녹아든 커스텀 도구 — 범용 SaaS 도구로는 재현 불가. 데이터 축적에 따른 트렌드 분석 우위.

### Key Benefits

| Benefit | Target Persona | Pain Point Addressed |
|---|---|---|
| 데일리 자동 데이터 수집 → 수기 입력 제거 | 민지 (ASO 매니저) | 매일 30분~1시간 수동 입력 |
| 키워드 랭킹 변동 즉시 감지 (Slack 알림) | 민지, 준호 | 당일 감지 불가 → 대응 지연 |
| 주력/보조 키워드 기준 기반 자동 분류 & 제안 | 준호 (ASO 실무자) | 체계적 키워드 발굴 프로세스 부재 |
| 통합 뷰 (랭킹 + 다운로드 + CVR 교차 분석) | 민지, 재현 | 데이터 분산으로 통합 분석 불가 |
| 리더를 위한 요약 대시보드 | 재현 (PM) | 매번 담당자에게 요청 |

---

## Competitive Analysis

### Competitors

| Name | Type | Strengths | Weaknesses | Market Position | Pricing Model | Key Differentiator |
|---|---|---|---|---|---|---|
| Sensor Tower (대시보드) | Direct | 가장 포괄적 데이터, 키워드 인텔리전스, 광고 인텔리전스 | 연 $25K-50K+ 고비용, 커스텀 키워드 분류 불가, 스토어 콘솔 데이터 미통합 | Leader | Enterprise | 데이터 커버리지 |
| AppTweak | Direct | ML 기반 추정치, 스토어 데이터 자동 익스포트, 가성비 | $83-549/month 추가 비용, 팀 고유 분류 기준 미지원 | Challenger | SaaS (월/연) | 스토어 콘솔 연동 |
| AppFollow | Direct | 리뷰 관리 강점, 무료 플랜, 슬랙 알림 | 키워드 인텔리전스 약함 | Niche | Freemium | 리뷰 관리 |
| 기존 수기 스프레드시트 | Indirect | 비용 0, 완전한 커스텀 | 수동 입력, 휴먼 에러, 시간 낭비 | 현행 | Free | 자유도 |
| Asodesk | Indirect | 모니터링 자동화, 슬랙 알림 | 한국 시장 데이터 커버리지 불확실 | Niche | SaaS | 알림 자동화 |

### Competitive Matrix

| Capability | ASO Keyword Monitor (Ours) | Sensor Tower | AppTweak | 수기 스프레드시트 |
|---|---|---|---|---|
| 키워드 랭킹 트래킹 | ✅ (센서타워 데이터) | ✅ | ✅ | ✅ (수동) |
| 스토어 콘솔 데이터 통합 | ✅ (ASC API 자동) | ❌ | ✅ | ✅ (수동) |
| 데일리 자동 수집 | ✅ | ✅ | ✅ | ❌ |
| 주력/보조 키워드 자동 분류 | ✅ | ❌ | ❌ | ✅ (수동) |
| 키워드 제안 (기준 기반) | ✅ | 부분적 | ✅ (AI) | ❌ |
| 랭킹↔다운로드↔CVR 교차 분석 | ✅ | 부분적 | ✅ | ❌ |
| Slack 알림 | ✅ | ❌ | ❌ | ❌ |
| 추가 비용 | $0 (인프라) | $0 (기존 구독 활용) | $83+/month | $0 |
| 커스텀 키워드 기준 | ✅ | ❌ | ❌ | ✅ (수동) |

### Opportunity Gaps

1. **팀 맞춤형 키워드 분류**: 기존 ASO 도구들은 Generic한 키워드 카테고리(브랜드/경쟁사/일반)만 제공. 콴다 팀의 "방어 키워드 / 부수 키워드" 같은 고유 분류 기준을 지원하지 않음. → 커스텀 분류 체계 구현으로 차별화.

2. **센서타워 + 스토어 콘솔 통합 뷰**: 센서타워는 키워드 인텔리전스에 강하지만 실제 스토어 성과(다운로드, CVR)와의 교차 분석은 별도 작업 필요. AppTweak는 이를 제공하나 추가 비용 발생. → 기존 센서타워 구독 + 무료 API로 통합 구현.

3. **키워드 제안 자동화**: 트래픽 점수 3.0+ 등 정량 기준 기반의 자동 키워드 제안은 기존 도구에서 팀 커스텀 기준으로 제공하지 않음. → 룰 기반 키워드 스크리닝 & 제안 구현.

---
