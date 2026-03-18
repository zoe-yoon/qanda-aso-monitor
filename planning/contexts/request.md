# Project Understanding: ASO Keyword Monitoring Dashboard

> **Created**: 2026-03-10
> **Phase**: 1 - Understand
> **Status**: Complete

---

## Project Summary

**One-liner**: 센서타워 + Store Connect 데이터를 연동하여 ASO 키워드 랭킹과 앱 순위를 데일리 자동 모니터링하는 대시보드/스프레드시트
**Domain**: 모바일 앱 마케팅 / ASO (App Store Optimization)
**Project Type**: 신규 제품

## Problem Statement (As Understood)

### The Problem

ASO 키워드 랭킹, 앱 순위, 다운로드, CVR 등의 핵심 지표를 매일 수기로 Google Spreadsheet에 기록하고 있어 비효율적이며, 변화 추이를 실시간으로 파악하기 어려움.

### Who Has This Problem

ASO/마케팅 담당자가 매일 센서타워와 스토어 콘솔을 오가며 수동으로 데이터를 수집하고 있음.

### Current Solutions

- Google Spreadsheet에 수기 리포팅 (https://docs.google.com/spreadsheets/d/1Yi2iHhvgSF9xmxW6dX9p7Vf99teHY4G_GLPw0BlBIhs)
- 센서타워 대시보드 직접 확인
- App Store Connect / Google Play Console 직접 확인

### Why Current Solutions Fall Short

- 수기 입력으로 인한 시간 낭비와 휴먼 에러
- 데이터 소스가 분산되어 통합 뷰 부재
- 트렌드 변화를 즉시 감지하기 어려움
- 키워드 제안/발굴 프로세스가 체계적이지 않음

## Target Users (As Described)

### Primary Users

- **Who**: ASO/마케팅 담당자
- **Goals**: 키워드 랭킹 변동을 데일리로 모니터링, 주력/보조 키워드 성과 추적
- **Pain Points**: 수기 리포팅 비효율, 분산된 데이터 소스

### Secondary Users / Stakeholders

- **Who**: PM, 제품 조직 리더
- **Interest**: ASO 성과 확인, CAC 절감 목표 달성 여부 추적

## Vision & Success Criteria

### Product Vision

센서타워와 스토어 데이터를 자동으로 수집하여, 키워드 랭킹/앱 순위/다운로드/CVR을 한눈에 보고, 주력/보조 키워드 아이디어까지 제안받을 수 있는 모니터링 도구.

### Success Indicators

- 수기 리포팅 시간 제거 (자동화)
- 키워드 랭킹 변동 즉시 감지
- 주력/보조 키워드 제안으로 ASO 전략 지원
- ASO 점수 81% → 85% 달성 기여

## Known Constraints

- **Budget**: 미정 (센서타워 API 비용 확인 필요)
- **Timeline**: 오늘 당장 구축
- **Team**: ASO/마케팅 담당자 중심
- **Technology**: 센서타워 API, Google/Apple Store Connect API
- **Regulatory**: N/A

## Keyword Selection Criteria (User-Defined)

### 주요 키워드 (방어 키워드) 선정 기준
- 콴다와 직접적으로 연관되는 키워드
- 수학, 문제, 풀이, 답지, 교육, 공부, 시험 등
- 현재 오가닉 다운로드 비중이 높은 generic 키워드

### 부수 키워드 선정 기준
- 트래픽 점수 3.0 이상 (조회일 기준 1달 전후)
- 콴다와 직/간접적으로 연관
  - 직접 연관: ai, 공부, 풀다, 내신, 모의고사
  - 간접 연관 (서브 기능): 공부 타이머, 영단어, 기출, 과학

## Known Competition

| Competitor | What They Do Well | What They Do Poorly |
|---|---|---|
| 말해보카 | ASO 점수 85~90% | N/A |
| 스픽 | ASO 점수 85~90% | N/A |
| 듀오링고 | ASO 점수 85~90% | N/A |
| 찰칵 | 스크린샷에 실사용 녹화본 삽입 → CVR 높음 | N/A |

## Existing Internal Context

| Category | Status | Source |
|---|---|---|
| 기존 스펙/PRD | ✅ | Notion Epic + KR PRD |
| 유저 저니 | ⬜ | N/A |
| 메트릭/KPI | ✅ | ASO 점수, 키워드 랭킹, CVR, 다운로드 |
| 시장 분석 | ✅ | contexts/market-research.md (ASO 도구 시장 비교, 가격, 트렌드) |
| 경쟁사 분석 | ✅ | contexts/market-research.md (Sensor Tower, AppTweak, AppFollow, data.ai, Mobile Action 비교) |
| 도메인 분석 | ✅ | contexts/domain-research.md (API 연동, 아키텍처, 자동화 방법) |
| 유저 인사이트 | ⬜ | N/A |

## Open Questions for Research

- 센서타워 API 접근 방식 및 비용 구조
- Google Play Console API / App Store Connect API 연동 방법
- 기존 ASO 모니터링 도구 벤치마크 (AppFollow, AppTweak 등)
- 키워드 제안 자동화 가능 범위

## Key Assumptions

- 센서타워 계정과 API 접근 권한이 있음
- Google Play Console과 App Store Connect 접근 권한이 있음
- KR 마켓을 우선 대상으로 하며 추후 다국가 확장
- 오늘 빠르게 MVP를 구축하는 것이 최우선 (완성도보다 속도)
