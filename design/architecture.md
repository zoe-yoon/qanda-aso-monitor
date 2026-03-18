# Information Architecture: ASO Keyword Monitor

> **Created**: 2026-03-10
> **Phase**: 3 - Architecture

---

## Sitemap

### Top-Level Sections

| Section | Path | Description | Access Level |
|---|---|---|---|
| Overview | / | KPI 요약 카드, 주요 변동 알림, ASO 점수 현황 | authenticated |
| Keywords | /keywords | 키워드 랭킹/다운로드/CVR 통합 테이블, 주력/보조 탭 분류 | authenticated |
| Keyword Detail | /keywords/:id | 특정 키워드 상세 추이 (30일 차트, CVR, 경쟁사) | authenticated |
| Suggestions | /suggestions | 기준 기반 키워드 제안 목록, 채택 플로우 | authenticated |
| Competitors | /competitors | 경쟁사 키워드 랭킹 비교 (P1) | authenticated |
| Reports | /reports | 주간 요약 리포트 목록 및 상세 (P1) | authenticated |
| Settings | /settings | Slack 알림 설정, 데이터 수집 상태, 키워드 분류 기준 관리 | authenticated |
| 404 | /404 | 존재하지 않는 페이지 | public |
| Error | /error | 시스템 오류 | public |

### Hierarchy

```
ASO Keyword Monitor
├── Overview (/)
├── Keywords (/keywords)
│   └── Keyword Detail (/keywords/:id)
├── Suggestions (/suggestions)
├── Competitors (/competitors)
├── Reports (/reports)
├── Settings (/settings)
└── Utility Pages
    ├── 404 Not Found (/404)
    └── Error (/error)
```

---

## Navigation Model

### Layout Context

QANDA AI Web(qore-frontend) 레이아웃 패턴 기반. Sidebar(226px) + Main Content 구조.

### Primary Navigation

- **Type**: sidebar
- **Position**: fixed-left
- **Items**:

| Label | Icon | Path | Badge |
|---|---|---|---|
| Overview | LayoutDashboard | / | — |
| Keywords | Search | /keywords | 키워드 수 (30) |
| Suggestions | Lightbulb | /suggestions | 신규 제안 수 |
| Competitors | Users | /competitors | — |
| Reports | FileText | /reports | — |

- **Behavior**:
  - Desktop (>= 640px): 226px 고정 사이드바, 항상 펼침. QANDA AI 패턴의 접이식(marginLeft -238px) 메커니즘 적용 가능하나 MVP에서는 항상 펼침.
  - Mobile (< 640px): 사이드바 숨김, MobileHeader(sticky top) + MobileBottomNavigation(sticky bottom, 64px) 전환. 단, desktop-first이므로 모바일은 P2.
  - Active State: `text-Foreground-Primary` + Fill 아이콘. Inactive: `text-Foreground-Tertiary` + Outline 아이콘.

### Sidebar Structure

```
Sidebar (226px, flex-col, bg-Background-Card, rounded-xl, shadow-1)
├── Header: 로고 (ASO Monitor) + 접기 버튼          [p-3]
├── Menu Items (flex-1):                             [px-1]
│   ├── Overview (LayoutDashboard)
│   ├── Keywords (Search)
│   ├── Suggestions (Lightbulb)
│   ├── Competitors (Users)
│   └── Reports (FileText)
├── Divider                                          [px-2]
└── Bottom Section:                                  [py-2, px-1]
    ├── 데이터 수집 상태 (마지막 업데이트 시각)
    └── Settings (Settings 아이콘)
```

### Secondary Navigation

- **Type**: sub-nav-tabs
- **Visibility**: Keywords 페이지 내에서만 표시
- **Items**: 전체 / 주력(방어) / 보조(확장) / 미분류

### Breadcrumb Strategy

- **Show On**: Keyword Detail 등 2레벨 이상 페이지
- **Format**: Keywords > {키워드명}
- **Behavior**: 모든 항목 클릭 가능, 마지막은 plain text

---

## Content Hierarchy

| Level | Content Type | Visual Treatment |
|---|---|---|
| Primary | KPI 수치, 키워드 랭킹, 변동 배지 | Title2/Headline_Strong, 대비 높은 색상, 상단/중앙 배치 |
| Secondary | 다운로드 수, CVR, 트래픽 점수 | Subheadline, 보조 텍스트 색상 |
| Tertiary | 데이터 출처 레이블, 업데이트 시각, 기준일 | Caption1/Footnote, Foreground-Tertiary |
| Actions | CTA 버튼, 채택, 분류 변경, 필터 | Key-Background1 (Primary), Interactive-Background1 (Secondary) |

---

## User Flows

### Flow: 데일리 모닝 키워드 체크

**ID**: F-001
**Trigger**: 매일 오전 출근 후 대시보드 접속
**Actor**: P-01 민지 (ASO 매니저)
**Priority**: Critical

| Step | Screen | User Action | System Response | Decision Point |
|---|---|---|---|---|
| 1 | S-001: Overview | 대시보드 URL 접속 | KPI 카드 + 주요 변동 요약 표시 | |
| 2 | S-001: Overview | 데이터 수집 상태 확인 | "마지막 업데이트 오늘 06:30" 표시 | 수집 실패? |
| 3 | S-001: Overview | 주요 변동 카드에서 하락 키워드 확인 | 하락 키워드 목록 (빨간 배지) 표시 | 하락 있음? |
| 4 | S-002: Keywords | 하락 키워드 클릭 또는 Keywords 탭 이동 | 키워드 테이블 표시, 변동순 정렬 | |
| 5 | S-003: Keyword Detail | 특정 키워드 행 클릭 | 30일 랭킹 추이 + CVR + 다운로드 차트 | |
| 6 | S-003: Keyword Detail | 교차 분석 확인 후 대응 결정 | — | |

**Success State**: 5분 내 어제 대비 주요 변동 파악 완료

**Error States**:
- 데이터 수집 실패: 에러 배너 + 마지막 성공 데이터 표시 (Stale 경고)
- 키워드 미등록: "키워드를 추가하여 모니터링을 시작하세요" CTA

---

### Flow: 신규 키워드 발굴 및 채택

**ID**: F-002
**Trigger**: 키워드 리뷰 주기 또는 민지의 보강 요청
**Actor**: P-02 준호 (ASO 실무자)
**Priority**: Critical

| Step | Screen | User Action | System Response | Decision Point |
|---|---|---|---|---|
| 1 | S-004: Suggestions | Suggestions 탭 클릭 | 제안 키워드 목록 + 필터 패널 표시 | |
| 2 | S-004: Suggestions | 트래픽 3.0+ 필터 적용 | 필터된 제안 목록 갱신, "N개 발견" 표시 | |
| 3 | S-004: Suggestions | 후보 키워드 행에서 경쟁사 랭킹 확인 | 인라인 경쟁사 랭킹 컬럼 표시 | |
| 4 | S-004: Suggestions | "채택" 버튼 클릭 | 분류 선택 모달 표시 | |
| 5 | S-008: Adopt Modal | "보조(확장) 키워드로 추가" 선택 | 채택 완료 토스트 + 목록에서 상태 변경 | |
| 6 | S-002: Keywords | Keywords 탭으로 이동 | 보조 탭에서 추가된 키워드 확인 | |

**Success State**: 3개 이상 키워드 채택 후 보조 키워드 목록에서 확인 완료

**Error States**:
- 기준 충족 키워드 없음: "현재 기준에 맞는 새 키워드가 없습니다" + 필터 조정 CTA
- 이미 모니터링 중: 해당 키워드에 "모니터링 중" 배지 표시

---

### Flow: 랭킹 급변동 알림 대응

**ID**: F-003
**Trigger**: Slack 알림 "키워드 '수학' 랭킹 -5위 변동 감지"
**Actor**: P-01 민지 (ASO 매니저)
**Priority**: Important

| Step | Screen | User Action | System Response | Decision Point |
|---|---|---|---|---|
| 1 | (Slack) | Slack 알림 내 "상세 확인하기" 딥링크 클릭 | 대시보드 해당 키워드 상세 페이지로 이동 | |
| 2 | S-003: Keyword Detail | 최근 7일 랭킹 추이 차트 확인 | 하락 시점 하이라이트 표시 | |
| 3 | S-003: Keyword Detail | CVR, 다운로드 데이터 동시 확인 | 복합 차트 (랭킹 + CVR + 다운로드) 표시 | |
| 4 | S-003: Keyword Detail | 경쟁사 랭킹 비교 섹션 확인 | 경쟁사 동일 키워드 랭킹 오버레이 | 전체 시장 변동? |
| 5 | S-003: Keyword Detail | 분석 완료 후 대응 방향 결정 | — | |

**Success State**: 알림 수신 후 5분 내 상황 파악 및 대응 방향 결정

**Error States**:
- 딥링크 키워드 미존재: 404 → Keywords 목록으로 리다이렉트
- 경쟁사 데이터 미수집: "경쟁사 데이터 없음" 메시지 + 센서타워 출처 안내

---

### Flow: PM 성과 자가 조회

**ID**: F-004
**Trigger**: 주간 팀 미팅 전 또는 경영진 보고 준비
**Actor**: P-03 재현 (PM)
**Priority**: Important

| Step | Screen | User Action | System Response | Decision Point |
|---|---|---|---|---|
| 1 | S-001: Overview | 대시보드 접속 | KPI 카드 + ASO 점수 프로그레스 바 표시 | |
| 2 | S-001: Overview | 주간 하이라이트 섹션 확인 | 상승/하락 Top 키워드, 다운로드 추이 요약 | 상세 필요? |
| 3 | S-006: Reports | Reports 탭 이동 | 주간 리포트 목록 및 최신 리포트 표시 | |
| 4 | S-006: Reports | 리포트 공유 버튼 클릭 | Slack 공유 또는 PDF 다운로드 옵션 | |

**Success State**: 담당자 요청 없이 이번 주 ASO 성과 파악 + 리포트 공유 완료

**Error States**:
- 리포트 미생성 (첫 주): "아직 생성된 리포트가 없습니다" + 데이터 수집 시작 안내
- 데이터 부족: 부분 리포트 표시 + 부족 항목 명시

---

## Flow Summary

| Flow ID | Flow Name | Actor | Steps | Priority |
|---|---|---|---|---|
| F-001 | 데일리 모닝 키워드 체크 | P-01 민지 | 6 | Critical |
| F-002 | 신규 키워드 발굴 및 채택 | P-02 준호 | 6 | Critical |
| F-003 | 랭킹 급변동 알림 대응 | P-01 민지 | 5 | Important |
| F-004 | PM 성과 자가 조회 | P-03 재현 | 4 | Important |

---

## Screen Reference Index

| Screen ID | Screen Name | Referenced In Flows |
|---|---|---|
| S-001 | Overview | F-001 (step 1-3), F-004 (step 1-2) |
| S-002 | Keywords | F-001 (step 4), F-002 (step 6) |
| S-003 | Keyword Detail | F-001 (step 5-6), F-003 (step 2-5) |
| S-004 | Suggestions | F-002 (step 1-4) |
| S-005 | Competitors | — (P1, 독립 진입 또는 S-003 내 섹션) |
| S-006 | Reports | F-004 (step 3-4) |
| S-007 | Settings | — (독립 진입) |
| S-008 | Adopt Modal | F-002 (step 5) |
| S-009 | Reclassify Modal | — (S-002에서 트리거) |
