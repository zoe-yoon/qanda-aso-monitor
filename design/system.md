# Design System: ASO Keyword Monitor

> **Created**: 2026-03-10
> **Phase**: 4 - System
> **Base**: QDS3 (QANDA Design System 3)

---

## Component Library

### Atoms

#### StandardButton

**Category**: atom (QDS3)
**Used in**: S-001, S-002, S-004, S-007, S-008, S-009

**Description**: QDS3 기본 버튼. CTA, 필터 적용, 모달 액션 등에 사용.

**Variants & States**:

| Variant | States | Description |
|---|---|---|
| Primary | default, hover, active, disabled, loading | 주요 CTA (키워드 추가, 채택 확인, 저장) |
| Secondary | default, hover, active, disabled | 보조 액션 (취소, 필터 초기화) |
| Outlined | default, hover, active, disabled | 테두리 버튼 (CSV 익스포트, PDF 다운로드) |
| Negative | default, hover, active, disabled | 삭제/위험 (키워드 삭제) |

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| variant | 'Primary' \| 'Secondary' \| 'Outlined' \| 'Negative' | no | 'Primary' | 시각적 변형 |
| size | 'XS' \| 'S' \| 'M' \| 'L' | no | 'M' | 크기 |
| Icon | QDS3_IconComponent | no | - | 왼쪽 아이콘 |
| disabled | boolean | no | false | 비활성 |
| loading | boolean | no | false | 로딩 (Spinner 표시) |

---

#### IconButton

**Category**: atom (QDS3)
**Used in**: S-001, S-002, S-003, S-006, S-007, S-008, S-009

**Description**: 아이콘 전용 버튼. 닫기, 더보기, 설정, 새로고침 등에 사용.

**Variants & States**:

| Variant | States | Description |
|---|---|---|
| default | default, hover, active, disabled | 기본 아이콘 버튼 |
| ghost | default, hover | 배경 없는 아이콘 (모달 닫기 IconX) |

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| icon | QDS3_IconComponent | yes | - | 아이콘 |
| size | 'S' \| 'M' \| 'L' | no | 'M' | 크기 (24/32/40px) |
| aria-label | string | yes | - | 접근성 라벨 |

---

#### Badge

**Category**: atom (QDS3)
**Used in**: S-001, S-002, S-003, S-004, S-005

**Description**: 상태/분류 인디케이터. 키워드 분류, 모니터링 상태, 탭 카운트 등에 사용.

**Variants & States**:

| Variant | States | Description |
|---|---|---|
| Key | default | 주력(방어) 키워드 분류 배지 |
| Success | default | 보조(확장) 키워드 분류 배지 |
| Neutral | default | 미분류 키워드 배지 |
| Informative | default | 모니터링 중 상태 배지 |
| Notice | default | Stale 데이터 경고 배지 |

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| variant | 'Key' \| 'Success' \| 'Neutral' \| 'Informative' \| 'Notice' | no | 'Neutral' | 색상 변형 |
| label | string | yes | - | 배지 텍스트 |

---

#### Checkbox

**Category**: atom (QDS3)
**Used in**: S-005, S-007

**Description**: 경쟁사 선택, 알림 대상 키워드 선택에 사용.

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| checked | boolean | no | false | 체크 상태 |
| label | string | yes | - | 라벨 |
| onChange | function | yes | - | 변경 핸들러 |

---

#### RadioButton

**Category**: atom (QDS3)
**Used in**: S-007, S-008, S-009

**Description**: 분류 선택(주력/보조), 알림 대상 선택에 사용.

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| value | string | yes | - | 값 |
| label | string | yes | - | 라벨 |
| checked | boolean | no | false | 선택 상태 |

---

#### Tabs

**Category**: atom (QDS3)
**Used in**: S-002

**Description**: 키워드 분류 탭 내비게이션. 전체/주력(방어)/보조(확장)/미분류.

**Variants & States**:

| Variant | States | Description |
|---|---|---|
| underline | active, inactive | 하단 라인 인디케이터, active=Key-Foreground2 |

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| items | Array<{ label, count?, value }> | yes | - | 탭 항목 |
| activeValue | string | yes | - | 현재 활성 탭 |
| onChange | function | yes | - | 탭 변경 핸들러 |

---

#### Spinner

**Category**: atom (QDS3)
**Used in**: S-001, S-002, S-004, S-006

**Description**: 로딩 인디케이터. 데이터 수집 중, 제안 생성 중 표시.

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| size | 'S' \| 'M' \| 'L' | no | 'M' | 크기 |

---

#### Tooltip

**Category**: atom (QDS3)
**Used in**: S-001, S-002, S-003

**Description**: KPI 카드 호버, 변동 배지 호버, 스파크라인 호버 시 상세 정보 표시.

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| content | string \| ReactNode | yes | - | 툴팁 내용 |
| trigger | ReactNode | yes | - | 트리거 요소 |

---

#### Divider

**Category**: atom (QDS3)
**Used in**: S-007 (설정 섹션 구분)

---

### Molecules

#### ChangeBadge

**Category**: molecule (new)
**Used in**: S-001, S-002, S-003, S-005

**Description**: 전일 대비 랭킹 변동을 색상+아이콘+숫자로 표시하는 복합 배지. WCAG 1.4.1 준수를 위해 색상만이 아닌 방향 아이콘과 숫자를 함께 사용.

**Variants & States**:

| Variant | States | Description |
|---|---|---|
| up | default | 상승: ↑N, Success-Foreground2 (#0d9974), IconArrowUp |
| down | default | 하락: ↓N, Negative-Foreground2 (#fb2d36), IconArrowDown |
| neutral | default | 유지: →, Foreground-Tertiary (#999999) |
| noData | default | 데이터 없음: —, Foreground-Disabled (#b5b5b5) |

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| value | number \| null | yes | - | 변동 값 (양수=상승, 음수=하락, 0=유지, null=없음) |
| referenceDate | string | no | - | 기준일 (툴팁에 표시) |

---

#### KPICard

**Category**: molecule (new)
**Used in**: S-001, S-003

**Description**: 핵심 지표를 표시하는 카드. 지표명, 수치, 전일 대비 변동 배지 포함.

**Variants & States**:

| Variant | States | Description |
|---|---|---|
| default | loading, populated | 기본 KPI 카드 |
| progress | loading, populated | 프로그레스 바 포함 (ASO 점수) |

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| label | string | yes | - | 지표명 |
| value | string \| number | yes | - | 현재 수치 |
| change | number \| null | no | - | 전일 대비 변동 (ChangeBadge로 표시) |
| unit | string | no | - | 단위 (%, 위, 개) |
| target | number | no | - | 목표 값 (progress variant에서 사용) |
| tooltip | string | no | - | 상세 설명 (호버 시) |

---

#### Sparkline

**Category**: molecule (new)
**Used in**: S-002

**Description**: 7일 랭킹 추이를 테이블 셀 내에 표시하는 인라인 미니 차트.

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| data | number[] | yes | - | 7일 일별 데이터 |
| width | number | no | 80 | 차트 너비 (px) |
| height | number | no | 24 | 차트 높이 (px) |
| color | string | no | 'Interactive-Foreground2' | 선 색상 |

---

#### DataSourceLabel

**Category**: molecule (new)
**Used in**: S-001, S-002, S-003, S-005

**Description**: 데이터 출처와 마지막 업데이트 시각을 표시하는 레이블. "Data Trust First" 원칙 구현.

**Variants & States**:

| Variant | States | Description |
|---|---|---|
| success | default | 정상 수집 — 초록 점 + "마지막 업데이트 오늘 06:30" |
| error | default | 수집 실패 — 빨간 점 + "수집 실패" + 재시도 버튼 |
| stale | default | Stale 데이터 — 노란 점 + "어제 데이터 (수집 지연)" |
| manual | default | 수동 입력 — 회색 점 + "수동 입력 (주 1회)" |

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| source | 'sensor-tower' \| 'asc' \| 'manual' | yes | - | 데이터 출처 |
| lastUpdated | Date \| null | yes | - | 마지막 업데이트 시각 |
| status | 'success' \| 'error' \| 'stale' \| 'manual' | yes | - | 수집 상태 |
| onRetry | function | no | - | 재시도 핸들러 (error 상태 시) |

---

#### SearchInput

**Category**: molecule (new)
**Used in**: S-002, S-004

**Description**: 키워드 검색 입력 필드. QDS3 InputField 기반에 검색 아이콘 추가.

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| placeholder | string | no | '키워드 검색' | 플레이스홀더 |
| value | string | yes | - | 입력 값 |
| onChange | function | yes | - | 변경 핸들러 |
| onClear | function | no | - | 초기화 핸들러 |

---

#### FilterChip

**Category**: molecule (new)
**Used in**: S-002, S-004, S-005

**Description**: 필터 조건을 표시하는 칩. 활성/비활성 토글 가능.

**Variants & States**:

| Variant | States | Description |
|---|---|---|
| default | active, inactive | 필터 칩 (활성 시 Key-Background2 배경) |

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| label | string | yes | - | 필터 라벨 |
| active | boolean | no | false | 활성 상태 |
| onToggle | function | yes | - | 토글 핸들러 |
| onRemove | function | no | - | 제거 핸들러 |

---

#### CriteriaInfoPanel

**Category**: molecule (new)
**Used in**: S-002, S-004

**Description**: 키워드 분류 기준을 접힘/펼침으로 표시하는 정보 패널.

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| title | string | yes | - | 패널 제목 |
| content | ReactNode | yes | - | 기준 설명 내용 |
| defaultOpen | boolean | no | false | 기본 펼침 여부 |

---

#### NotableChangeItem

**Category**: molecule (new)
**Used in**: S-001

**Description**: Overview의 주요 변동 목록 행. 키워드명 + ChangeBadge + 현재 랭킹.

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| keyword | string | yes | - | 키워드명 |
| change | number | yes | - | 변동 값 |
| currentRank | number | yes | - | 현재 랭킹 |
| onClick | function | yes | - | 클릭 핸들러 (→ Keyword Detail) |

---

### Organisms

#### PageShell

**Category**: organism (new, QANDA AI layout 기반)
**Used in**: 모든 화면

**Description**: 전체 앱의 최상위 레이아웃 셸. Sidebar + Main Content 구조. QANDA AI Web의 PagesLayout 패턴 기반.

**Structure**:

```
PageShell (h-screen-safe, flex-row, bg-Background-Canvas)
├── Sidebar (226px, desktop only)
└── Main Content (flex-1, overflow-auto)
    ├── PageHeader (sticky top)
    └── Page Content (scrollable)
```

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| children | ReactNode | yes | - | 메인 콘텐츠 |

---

#### Sidebar

**Category**: organism (new, QANDA AI layout 기반)
**Used in**: 모든 화면

**Description**: 좌측 고정 사이드바. 226px, 로고 + 메뉴 + 데이터 수집 상태 + 설정. QANDA AI Web Sidebar 패턴 기반 (접이식 미적용, MVP에서 항상 펼침).

**Structure**:

```
Sidebar (226px, flex-col, bg-Background-Card, rounded-xl, shadow-1)
├── Header: 로고 (ASO Monitor)                          [p-3]
├── Menu Items (flex-1):                                 [px-1]
│   ├── MenuItem (Overview, IconLayoutDashboard)
│   ├── MenuItem (Keywords, IconSearch, badge: count)
│   ├── MenuItem (Suggestions, IconLightbulb, badge: count)
│   ├── MenuItem (Competitors, IconUsers)
│   └── MenuItem (Reports, IconFileText)
├── Divider                                              [px-2]
└── Bottom Section:                                      [py-2, px-1]
    ├── DataSourceLabel (마지막 업데이트)
    └── MenuItem (Settings, IconSettings)
```

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| activePath | string | yes | - | 현재 활성 경로 |
| dataStatus | DataSourceStatus | yes | - | 데이터 수집 상태 |

---

#### PageHeader

**Category**: organism (new)
**Used in**: S-001, S-002, S-003, S-004, S-005, S-006, S-007

**Description**: 각 페이지 상단에 표시되는 고정 헤더. 타이틀 + 부가 정보 + 액션 버튼.

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| title | string | yes | - | 페이지 타이틀 |
| breadcrumbs | Array<{ label, href }> | no | - | 브레드크럼 (2레벨+ 페이지) |
| actions | ReactNode | no | - | 우측 액션 영역 (버튼 등) |
| subtitle | ReactNode | no | - | 부제목/배지 영역 |

---

#### DataTable

**Category**: organism (QDS3 Table 확장)
**Used in**: S-002, S-004, S-005

**Description**: 키워드 데이터를 표시하는 정렬/필터 가능한 테이블. QDS3 Table 기반에 고정 헤더, 고정 첫 컬럼, 스파크라인 셀, ChangeBadge 셀 등 확장.

**Features**:
- 고정 헤더 (sticky header, z-index: table-header)
- 고정 첫 컬럼 (키워드명, sticky left)
- 정렬 가능 컬럼 (클릭 토글: 오름차순/내림차순)
- 행 클릭 → 상세 이동
- 행 컨텍스트 메뉴 (더보기 IconEllipsisHorizontal)
- 셀 타입: text, number, badge, sparkline, changeBadge

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| columns | ColumnDef[] | yes | - | 컬럼 정의 |
| data | Row[] | yes | - | 테이블 데이터 |
| onRowClick | function | no | - | 행 클릭 핸들러 |
| sortBy | string | no | - | 현재 정렬 컬럼 |
| sortOrder | 'asc' \| 'desc' | no | - | 정렬 방향 |
| onSort | function | no | - | 정렬 변경 핸들러 |
| stickyFirstColumn | boolean | no | true | 첫 컬럼 고정 |
| emptyMessage | string | no | - | 데이터 없을 때 메시지 |

---

#### TrendChart

**Category**: organism (new)
**Used in**: S-003

**Description**: 30일 랭킹/다운로드/CVR 추이를 표시하는 라인/바 복합 차트. 경쟁사 오버레이 토글 지원.

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| data | TimeSeriesData[] | yes | - | 시계열 데이터 |
| type | 'line' \| 'bar' \| 'composite' | no | 'line' | 차트 타입 |
| period | '7d' \| '30d' \| '90d' | no | '30d' | 표시 기간 |
| competitors | CompetitorData[] | no | - | 경쟁사 오버레이 데이터 (P1) |
| showCompetitors | boolean | no | false | 경쟁사 표시 토글 |

---

#### AdoptModal

**Category**: organism (new, QDS3 Dialog 기반)
**Used in**: S-008

**Description**: 키워드 채택 시 분류 선택 모달. QDS3 Dialog 패턴 (Overlay + Card + Title + Content + Actions).

**Structure**:

```
Dialog (400px, centered, Overlay-Dimmed)
├── Header: "키워드 추가" + IconButton(IconX)
├── Keyword Info: 키워드명 + 트래픽 점수 Badge
├── Classification Select: RadioButton × 2 (주력/보조)
└── Actions: StandardButton(Secondary, '취소') + StandardButton(Primary, '추가')
```

---

#### ReclassifyModal

**Category**: organism (new, QDS3 Dialog 기반)
**Used in**: S-009

**Description**: 키워드 분류 변경 확인 모달. QDS3 Dialog 패턴.

**Structure**:

```
Dialog (400px, centered, Overlay-Dimmed)
├── Header: "분류 변경" + IconButton(IconX)
├── Current State: "현재: {분류}" Badge
├── New Classification: RadioButton × 3 (주력/보조/미분류)
└── Actions: StandardButton(Secondary, '취소') + StandardButton(Primary, '변경')
```

---

#### ReportViewer

**Category**: organism (new)
**Used in**: S-006

**Description**: 주간 리포트 상세 뷰어. KPI 요약 카드 + 하이라이트 섹션 + 성과 테이블 + 공유 버튼.

**Props**:

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| report | WeeklyReport | yes | - | 리포트 데이터 |
| onShareSlack | function | no | - | Slack 공유 핸들러 |
| onDownloadPDF | function | no | - | PDF 다운로드 핸들러 |

---

#### Snackbar

**Category**: organism (QDS3)
**Used in**: S-008, S-009, S-007

**Description**: 액션 완료 확인 토스트. QDS3 Snackbar 사용.

**Variants & States**:

| Variant | States | Description |
|---|---|---|
| default | visible, hidden | 성공 메시지 ("키워드가 추가되었습니다") |
| error | visible, hidden | 에러 메시지 |

---

## Shared Accessibility Standards

All components follow these standards unless explicitly overridden:

- **Focus**: 2px solid ring (Interactive-Stroke1 #0785f2), offset 2px. Visible on keyboard navigation.
- **Touch targets**: Minimum 44x44px
- **ARIA**: Interactive elements use semantic HTML (`<button>`, `<input>`, `<a>`)
- **Disabled**: `aria-disabled="true"`, Overlay-Disabled, `cursor-not-allowed`
- **Loading**: `aria-busy="true"`, Spinner replaces content
- **Keyboard**: Enter/Space activates buttons, Escape dismisses overlays, Arrow keys navigate lists/tabs
- **Labels**: Icon-only buttons require `aria-label`, all form fields require `<label>`
- **Color contrast**: 4.5:1 for normal text (Subheadline 14px), 3:1 for large text (Title1 24px+)
- **Color independence**: ChangeBadge는 색상 + 방향 아이콘(↑↓) + 숫자를 함께 사용 (WCAG 1.4.1)

---

## Interaction Patterns

| Pattern | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Button Press | click | scale(0.98) | 100ms | ease-out |
| Page Transition | route change | fade-in | 200ms | ease-in-out |
| Modal Open | action click | overlay fade + content scale(0.95→1) | 200ms | ease-out |
| Modal Close | dismiss/escape | fade-out + scale(1→0.95) | 150ms | ease-in |
| Toast Appear | system event | slide-down + fade-in | 200ms | ease-out |
| Toast Dismiss | auto (3s) / swipe | fade-out | 150ms | ease-in |
| Tab Switch | tab click | underline slide | 200ms | ease-in-out |
| Dropdown Open | click trigger | fade + slide-down (4px) | 150ms | ease-out |
| Skeleton Pulse | data loading | opacity(0.4→1→0.4) | 1.5s | linear loop |
| Sparkline Hover | mouse enter cell | tooltip fade-in | 100ms | ease-out |
| Row Hover | mouse enter row | background → Overlay-Hover | instant | — |
| Collapsible Toggle | click header | height animate | 200ms | ease-in-out |

---

## Loading Strategy

| Scenario | Approach |
|---|---|
| Initial Page Load | Full-page skeleton matching layout (KPI cards + table rows) |
| Route Navigation | Route-level skeleton (PageHeader remains, content skeleton) |
| Data Refresh | Component-level skeleton (테이블만 스켈레톤, KPI 유지) |
| Keyword Suggestion Generation | Inline progress ("키워드 스크리닝 중...") + Spinner |
| Modal Submit | Button loading state (Spinner replaces label) |
| Background Sync (GAS 수집) | Silent — DataSourceLabel 타임스탬프만 갱신 |

---

## Error Handling UX

| Error Type | Display | Recovery |
|---|---|---|
| Data Collection Failure | PageHeader 내 에러 배너 (빨간) + Stale 데이터 유지 | DataSourceLabel 재시도 버튼 |
| Network Error | Snackbar(error) | 자동 재시도 (3회) + 수동 재시도 |
| Keyword Not Found (404) | 전용 페이지 → Keywords 목록 리다이렉트 | "키워드 목록으로 돌아가기" 링크 |
| API Auth Expired | 에러 배너 "인증이 만료되었습니다" | Settings 페이지 링크 |
| Empty State | 각 화면별 맞춤 빈 상태 메시지 + CTA | 다음 액션 안내 (키워드 추가, 필터 변경 등) |
| Filtered Empty | "조건에 맞는 키워드가 없습니다" | 필터 초기화 버튼 |
| Report Generation Failure | "리포트 생성 실패" + 재시도 | 재시도 버튼 |

---

## Responsive Breakpoints

| Name | Min Width | Tailwind Prefix | Key Changes |
|---|---|---|---|
| mobile | 0px | (base) | Sidebar 숨김, 단일 컬럼, KPI 카드 세로 스택 (P2) |
| tablet | 640px | tablet: | Sidebar 표시 (226px), 메인 콘텐츠 flex-1, 패딩 12px |
| desktop | 1280px | desktop: | 테이블 전체 컬럼 표시, 경쟁사 컬럼 확장 |

> Desktop-first 접근이므로 tablet (640px+)이 주요 타깃. Mobile은 P2.
