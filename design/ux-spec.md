# UX Spec Summary: ASO Keyword Monitor

> **Created**: 2026-03-10
> **PRD**: planning/product-brief.md, planning/strategy-brief.md
> **Status**: Draft

This file is a **summary index** that provides quick orientation and links to detailed artifacts. Each section is a concise summary — full details live in the individual artifact files.

**Artifact files**:

- `foundation.md` — Design tokens, colors, typography, spacing
- `architecture.md` — Sitemap, navigation model, user flows
- `screens.md` — Screen inventory and screen details
- `system.md` — Component library specs

---

## Project Overview

ASO Keyword Monitor는 콴다 ASO 팀(2-3명)이 센서타워 + App Store Connect 데이터를 하나의 웹 대시보드에서 자동 모니터링하는 내부 도구. 매일 수기 입력에 소요되던 30분~1시간을 제거하고, 주력(방어)/보조(확장) 키워드 분류 기반의 체계적 관리와 키워드 제안 기능을 제공한다.

**Target Users**: 민지(ASO 매니저, 일일 모니터링), 준호(ASO 실무자, 키워드 리서치), 재현(PM, 성과 요약 열람)

---

## Design Vision

데이터 분산과 수작업 반복에서 벗어나, 매일 아침 하나의 화면에서 키워드 성과를 즉시 파악하고 전략적 의사결정에 집중할 수 있는 명확하고 신뢰감 있는 모니터링 환경.

**Approach**: desktop-first (3명 전원 데스크탑 사무실 사용, 데이터 밀도 높은 테이블 UI)

**Design Principles**:

1. **Data Trust First**: 모든 데이터에 수집 시각, 출처, 상태 명시
2. **Scan, Don't Search**: 중요 변동은 색상+아이콘+숫자로 즉시 드러남
3. **Role-Aware Entry**: 각 역할의 최우선 정보가 진입 시 바로 보임
4. **Classification as Structure**: 주력/보조 분류가 내비게이션의 1차 축
5. **Minimum Friction**: 핵심 액션 3클릭 이내 완료

→ Full details: `foundation.md`

---

## Sitemap Overview

```
ASO Keyword Monitor
├── Overview (/)
├── Keywords (/keywords)
│   └── Keyword Detail (/keywords/:id)
├── Suggestions (/suggestions)
├── Competitors (/competitors)        [P1]
├── Reports (/reports)                [P1]
├── Settings (/settings)
└── Utility Pages
    ├── 404 (/404)
    └── Error (/error)
```

**Navigation**: Sidebar (226px, QANDA AI Web 패턴 기반) + Sub-nav tabs (Keywords 페이지 내 분류 탭)

→ Full details: `architecture.md`

---

## Screen Inventory

| ID | Name | Layout Type |
|---|---|---|
| S-001 | Overview | dashboard |
| S-002 | Keywords | single-column (table) |
| S-003 | Keyword Detail | single-column (charts) |
| S-004 | Suggestions | single-column (table) |
| S-005 | Competitors | single-column (table) [P1] |
| S-006 | Reports | split-view [P1] |
| S-007 | Settings | single-column (cards) |
| S-008 | Adopt Modal | modal (400px) |
| S-009 | Reclassify Modal | modal (400px) |

**Total**: 9 screens, 25 user tasks (14 primary, 11 secondary)

→ Full details: `screens.md`

---

## Key User Flows

| Flow | Trigger | Screens | Actor |
|---|---|---|---|
| F-001: 데일리 모닝 키워드 체크 | 매일 오전 출근 | S-001 → S-002 → S-003 | P-01 민지 |
| F-002: 신규 키워드 발굴 및 채택 | 키워드 리뷰 주기 | S-004 → S-008 → S-002 | P-02 준호 |
| F-003: 랭킹 급변동 알림 대응 | Slack 알림 수신 | (Slack) → S-003 | P-01 민지 |
| F-004: PM 성과 자가 조회 | 주간 미팅 전 | S-001 → S-006 | P-03 재현 |

→ Full details: `architecture.md`

---

## Component Summary

| Category | Components |
|---|---|
| Atoms (9) | StandardButton, IconButton, Badge, Checkbox, RadioButton, Tabs, Spinner, Tooltip, Divider |
| Molecules (7) | ChangeBadge, KPICard, Sparkline, DataSourceLabel, SearchInput, FilterChip, CriteriaInfoPanel, NotableChangeItem |
| Organisms (8) | PageShell, Sidebar, PageHeader, DataTable, TrendChart, AdoptModal, ReclassifyModal, ReportViewer, Snackbar |

**Base**: QDS3 (QANDA Design System 3) — 기존 QDS3 컴포넌트 활용 + 도메인 특화 신규 컴포넌트

→ Full details: `system.md`

---

## Design Tokens Summary

**Colors**: Key(Brand) `#ed5000` (Orange), Success(상승) `#0d9974`, Negative(하락) `#fb2d36`, Interactive `#0785f2`
**Typography**: Pretendard Std, 11px–28px (15 styles), tabular nums 활성
**Spacing**: 4px base, scale: 0–64px
**Icons**: Lucide Icons, outlined, 1.5px stroke, 16/20/24/32px sizes

→ Full details: `foundation.md`

---

## Responsive Strategy

| Breakpoint | Width | Layout |
|---|---|---|
| mobile | 0px | Sidebar 숨김, 단일 컬럼 (P2) |
| tablet | 640px | Sidebar(226px) + Main Content |
| desktop | 1280px | 전체 컬럼 표시, 경쟁사 확장 |

---

## Handoff Notes

### Architect Prompt

이 대시보드는 데이터 신뢰도가 최우선이다. 모든 화면에서 "마지막 업데이트 시각 + 수집 상태"가 항상 보여야 한다. 핵심 화면은 Keywords(S-002)의 데이터 테이블로, 고정 헤더/첫 컬럼 + 변동 배지(색상+아이콘+숫자) + 인라인 스파크라인이 핵심 패턴이다. QANDA AI Web의 Sidebar 레이아웃 패턴을 기반으로 하되, ASO 도메인에 맞게 메뉴와 하단 영역을 커스터마이징한다. 3명의 내부 사용자이므로 온보딩보다 정보 밀도와 빠른 스캔에 최적화한다.

### Key Decisions

1. **QANDA AI Sidebar 레이아웃 채택**: 226px 고정 사이드바 + Main Content. 브랜드 일관성과 내부 도구 친숙감.
2. **Desktop-first**: 3명 전원 데스크탑 사용. 모바일 대응은 P2.
3. **주력/보조 분류를 IA 1차 축으로**: Keywords 탭 내 sub-nav tabs로 분류 전환. 모든 뷰에서 분류가 필터의 기본 축.
4. **ChangeBadge 접근성**: 색상만이 아닌 방향 아이콘(↑↓) + 숫자 병행. WCAG 1.4.1 준수.
5. **2-tier 아키텍처**: Google Sheets = 데이터 레이어, 웹 대시보드 = 프레젠테이션 레이어. DataSourceLabel로 데이터 신선도 항상 가시화.

### Open Questions

1. 센서타워 API 키워드 랭킹 엔드포인트 접근 가능 여부 — 불가 시 CSV Export + GAS 파싱으로 우회 필요
2. 차트 라이브러리 선택 (Recharts vs Chart.js vs Lightweight) — TrendChart, Sparkline 구현에 영향
3. Google Sheets 데이터 fetch 방식 (Sheets API 직접 vs 중간 서버 vs 정적 빌드) — 실시간성과 구현 복잡도 트레이드오프
4. 키워드 제안의 "콴다 연관성" 기준 구체화 — 제안 필터 컴포넌트 설계에 영향
