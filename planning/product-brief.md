# Product Brief: ASO Keyword Monitor

> **Created**: 2026-03-10
> **Author**: ASO Team
> **Status**: Draft

---

## Project Overview / Elevator Pitch

- **project_name**: ASO Keyword Monitor
- **tagline**: 센서타워 + 스토어 데이터를 하나로, 매일 자동으로
- **elevator_pitch**: ASO 팀이 매일 센서타워, App Store Connect, Google Play Console을 돌아다니며 수기로 키워드 랭킹과 앱 성과를 기록하는 비효율을 제거합니다. 센서타워와 스토어 콘솔 데이터를 자동 수집하여 Google Sheets에 통합하고, 팀 고유의 주력/보조 키워드 기준에 맞춘 모니터링과 키워드 제안을 제공합니다.
- **project_type**: 신규 제품
- **domain**: 모바일 앱 마케팅 / ASO (App Store Optimization)

---

## Problem Statement

### Current Situation

콴다 ASO 팀은 센서타워, App Store Connect, Google Play Console 3개 데이터 소스를 매일 수동으로 확인하고 Google Spreadsheet에 수기 입력하여 키워드 랭킹, 다운로드 수, CVR을 리포팅하고 있다. 업계 리서치에 따르면 "많은 ASO 팀이 키워드 선정, 메타데이터 최적화, 성과 리포팅에서 여전히 수동 프로세스를 유지"하고 있어 이는 공통 문제이다.

현재 ASO 점수 81%로 경쟁 앱(말해보카, 스픽, 듀오링고) 85~90% 대비 5~9%p 격차가 있으며, 브랜드 키워드 의존도 85% 이상으로 Generic 키워드 통한 신규 유저 유입이 거의 없는 상태.

### Pain Points

| Pain Point | Affected Users | Severity (1-5) |
|---|---|---|
| 매일 3개+ 데이터 소스를 수동 확인/입력 → 30분~1시간 소요 | ASO/마케팅 담당자 (2-3명) | 5 |
| 키워드 랭킹 변동을 당일에 감지하지 못함 | ASO 담당자 | 4 |
| 주력/보조 키워드 발굴이 체계적이지 않음 | ASO 담당자 | 4 |
| 데이터 분산으로 랭킹↔다운로드↔CVR 교차 분석 불가 | ASO 담당자, PM | 4 |
| 다국가 ASO 데이터 통합 관리 불가 | ASO 담당자 | 3 |

---

## Target Audience / Users

### Primary Users

| Persona Name | Demographics | Goals | Frustrations | Tech Proficiency |
|---|---|---|---|---|
| 민지 (ASO 매니저) | 20대 후반, 모바일 앱 마케팅 3년차, 콴다 마케팅팀 | 키워드 랭킹 변동 즉시 감지, 주력/보조 키워드 성과 추적, ASO 점수 85% 달성 | 매일 센서타워+스토어 콘솔 3곳 수기 입력, 트렌드 변화 놓침 | High |
| 준호 (ASO 실무자) | 20대 중반, 마케팅 1-2년차, 키워드 리서치 담당 | 신규 키워드 발굴, 경쟁사 키워드 벤치마크 | 키워드 선정 기준 비체계적, 데이터 기반 의사결정 어려움 | Medium-High |

### Secondary Users

| Persona Name | Demographics | Goals | Frustrations | Tech Proficiency |
|---|---|---|---|---|
| 재현 (PM/팀 리더) | 30대 초반, 제품 조직 리더, ASO Epic 오너 | ASO 성과 한눈에 확인, CAC 10% 절감 목표 추적 | 현황 파악 위해 담당자에게 매번 요청 필요 | Medium |

### Stakeholders

| Role | Interests | Influence Level |
|---|---|---|
| 마케팅 헤드 | CAC 절감 목표 달성, ROI 가시화 | High |
| 제품 조직 리더 | ASO Epic(QANC-2159) 진행 상황 | High |
| 엔지니어링 | API 연동 기술 지원 | Medium |

---

## Core Value Proposition

- **unique_value**: 센서타워 + 스토어 콘솔 데이터를 하나의 시트에 자동 통합하고, 콴다 고유의 키워드 분류 기준(주력 방어 / 부수 확장)에 맞춘 모니터링과 키워드 제안을 제공하는 내부 전용 도구. 기존 범용 ASO 도구가 제공하지 않는 "팀 맞춤형 키워드 분류 + 자동 트래킹 + 기준 기반 제안"을 하나로 묶음.
- **positioning_statement**: ASO 키워드 랭킹과 앱 성과를 매일 수기로 관리하는 콴다 마케팅팀을 위해, ASO Keyword Monitor는 센서타워와 스토어 데이터를 자동 수집하여 통합 모니터링하는 내부 대시보드이다. 기존 수기 스프레드시트와 달리, 데일리 자동 업데이트와 주력/보조 키워드 기준에 맞춘 제안 기능을 제공한다.

### Key Benefits

| Benefit | Target Persona |
|---|---|
| 데일리 자동 데이터 수집 → 수기 입력 제거 | 민지 (ASO 매니저) |
| 주력/보조 키워드 기준 기반 자동 분류 & 제안 | 준호 (ASO 실무자) |
| 통합 뷰 (랭킹 + 다운로드 + CVR 교차 분석) | 민지, 재현 |
| 키워드 랭킹 변동 즉시 감지 | 민지, 준호 |

---

## Key Features / MVP Scope

### Must Have (P0)

| Feature Name | Description | User Value |
|---|---|---|
| 센서타워 데이터 자동 수집 | 센서타워 API/Export로 키워드 랭킹, 트래픽 점수, 카테고리 랭킹을 데일리 자동 수집 → Google Sheets 적재 | 수기 입력 제거 |
| App Store Connect 데이터 연동 | ASC Analytics API로 iOS 다운로드, 임프레션, CVR 자동 수집 | iOS 성과 자동화 |
| 키워드 랭킹/다운로드/CVR 통합 시트 | 키워드별 랭킹 추이, 다운로드, CVR을 하나의 시트에서 교차 확인 | 분산 데이터 통합 |
| 주력/보조 키워드 분류 뷰 | 사용자 정의 기준(방어/확장)에 따라 키워드를 별도 탭으로 분류 표시 | 팀 키워드 전략 체계화 |
| 키워드 제안 기능 | 트래픽 3.0+, 콴다 연관성 기준으로 부수 키워드 후보를 자동 스크리닝하여 제안 시트 표시 | 체계적 키워드 발굴 |

### Should Have (P1)

| Feature Name | Description | User Value |
|---|---|---|
| Slack 알림 | 키워드 랭킹 급변동(±3위 이상) 시 Slack 자동 알림 | 변동 즉시 감지 |
| 랭킹 변동 하이라이트 | 전일 대비 상승/하락을 색상(녹/적)으로 자동 표시 | 변동 한눈에 파악 |
| 경쟁사 키워드 비교 | 말해보카, 스픽, 듀오링고, 찰칵의 동일 키워드 랭킹 비교 | 경쟁 포지션 파악 |
| 주간 요약 리포트 | 주 1회 핵심 지표 요약 자동 생성 | PM 수동 요청 불필요 |

### Nice to Have (P2)

| Feature Name | Description | User Value |
|---|---|---|
| Looker Studio 대시보드 | Sheets 데이터 시각화 | 시각적 트렌드 분석 |
| 다국가 확장 (US/JP/TW/TH) | KR 외 국가 데이터 수집 | 5개국 통합 관리 |
| Google Play 키워드 자동화 | Play Console 수동 의존 탈피 | Android 완전 자동화 |
| AI 키워드 추천 | LLM 활용 키워드 아이디어 생성 | 정교한 키워드 전략 |

### Out of Scope

| Item | Reason for Exclusion |
|---|---|
| ASO 메타데이터 직접 수정 | 모니터링 도구이며 실행 도구가 아님 |
| 리뷰/평점 관리 | 별도 PRD 존재 (26'02 ASO 평점 관리 개선안) |
| 광고 인텔리전스 | ASO 키워드 모니터링에 집중 |
| 커스텀 웹 대시보드 | 당일 구축 → Google Sheets MVP |

---

## Regulatory & Compliance

해당 제품은 내부 도구로서 외부 사용자 데이터를 직접 처리하지 않음. 다만 다음 사항 준수 필요:

- **API 인증 키 보안**: 센서타워 API Token, App Store Connect JWT Private Key는 GAS Script Properties에 안전하게 저장. 시트에 직접 노출 금지.
- **데이터 접근 권한**: Google Sheets 공유 범위를 ASO 팀 + PM으로 제한. 전사 공개 불필요.
- **서드파티 API 이용약관**: 센서타워 및 Apple API 이용약관에서 허용하는 범위 내에서 데이터 수집/저장.

---

## Constraints

| Type | Description |
|---|---|
| Budget | $0 (기존 센서타워 구독 + 무료 Google Workspace 활용) |
| Timeline | 오늘(3/10) MVP 구축, 26Y 1Q(3월 말) 안정화 |
| Technology | Google Sheets + Google Apps Script, 센서타워 API, App Store Connect API |
| Team | ASO/마케팅 담당자 2-3명 (구축 1명 주도) |
| Regulatory | N/A |

- **target_launch**: 2026-03-10 (오늘)
- **team_resources**: Claude(AI) + ASO 담당자 1명 협업 구축, ASO 팀 2-3명 검증, PM 승인

---
