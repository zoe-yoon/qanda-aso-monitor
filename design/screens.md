# Screen Inventory: ASO Keyword Monitor

> **Created**: 2026-03-10
> **Phase**: 3 - Architecture & Screens
> **Mode**: New Project

---

## Screen Inventory

| Screen ID | Name | Purpose | Entry Points | Exit Points | States |
|---|---|---|---|---|---|
| S-001 | Overview | KPI 요약, 주요 변동 알림, ASO 점수 현황 | Sidebar "Overview", 기본 랜딩 | S-002 (키워드 클릭), S-006 (리포트) | empty, loading, error, populated |
| S-002 | Keywords | 키워드 랭킹/다운로드/CVR 통합 테이블, 주력/보조 탭 | Sidebar "Keywords", S-001 변동 클릭 | S-003 (행 클릭), S-009 (분류 변경) | empty, loading, error, populated, filtered_empty |
| S-003 | Keyword Detail | 특정 키워드 30일 추이, CVR, 다운로드, 경쟁사 비교 | S-002 행 클릭, Slack 딥링크, S-001 변동 클릭 | S-002 (뒤로), S-005 (경쟁사 상세) | loading, error, populated |
| S-004 | Suggestions | 기준 기반 키워드 제안 목록, 필터, 채택 | Sidebar "Suggestions" | S-008 (채택 모달), S-002 (키워드 확인) | empty, loading, error, populated, all_adopted |
| S-005 | Competitors | 경쟁사 키워드 랭킹 비교 테이블 (P1) | Sidebar "Competitors" | S-003 (키워드 상세) | empty, loading, error, populated |
| S-006 | Reports | 주간 요약 리포트 목록 및 상세 (P1) | Sidebar "Reports", S-001 리포트 링크 | (Slack 공유, PDF 다운로드) | no_report, loading, error, populated |
| S-007 | Settings | Slack 알림 설정, 데이터 수집 상태, 분류 기준 관리 | Sidebar 하단 Settings | — | connected, disconnected, loading |
| S-008 | Adopt Modal | 키워드 채택 시 분류(주력/보조) 선택 | S-004 "채택" 버튼 | S-004 (닫기/완료) | default, submitting, success |
| S-009 | Reclassify Modal | 키워드 분류 변경 확인 | S-002 컨텍스트 메뉴 "분류 변경" | S-002 (닫기/완료) | default, submitting, success |

---

## Screen Details

### S-001: Overview

**Source**: NEW
**References**: none

**Purpose**: ASO 팀이 매일 아침 가장 먼저 확인하는 진입 화면. KPI 요약, 랭킹 변동 알림, ASO 점수 목표 달성률을 한눈에 보여준다. 민지(변동 감지)와 재현(요약 열람)의 1차 랜딩 페이지.

**Data Requirements**:

- KPI 카드: 모니터링 키워드 수, 평균 랭킹 (전일 대비), 총 다운로드 (전일 대비), 평균 CVR (전일 대비)
- ASO 점수: 현재 점수 (81%), 목표 (85%), 프로그레스
- 주요 변동 목록: 전일 대비 ±3위 이상 변동 키워드 (최대 10개)
- 데이터 수집 상태: 마지막 성공 시각, 출처별 상태 (센서타워, ASC)
- 주간 하이라이트: 상승 Top 3, 하락 Top 3 키워드

#### State Variations

- **Empty**: "키워드를 추가하여 모니터링을 시작하세요" + Keywords 탭 이동 CTA
- **Loading**: KPI 카드 스켈레톤 (4개) + 변동 목록 스켈레톤 (5행)
- **Error**: 에러 배너 "데이터 수집 실패" + 마지막 성공 데이터 표시 (Stale 경고)
- **Populated**: KPI 카드 + 변동 목록 + ASO 점수 + 주간 하이라이트

#### Layout

**Type**: dashboard

| Section | Position | Content Elements | Behavior |
|---|---|---|---|
| Page Header | top | 페이지 타이틀 "Overview" + 데이터 수집 상태 배지 | sticky |
| KPI Cards Row | top, below header | 4개 KPI 카드 (키워드 수, 평균 랭킹, 다운로드, CVR) - 각 카드에 수치 + 전일 대비 변동 배지 | scrollable |
| ASO Score Card | top-right or below KPI | 프로그레스 바 (81% → 85%) + 현재 점수 | fixed within view |
| Notable Changes | center | 랭킹 ±3위 이상 변동 키워드 리스트 (키워드명, 변동 배지, 현재 랭킹) | scrollable, 클릭 → S-003 |
| Weekly Highlights | bottom | 상승/하락 Top 3 요약 카드 2개 (녹/적 배경) | scrollable |

#### Key Interactions

- KPI 카드 호버 시 상세 툴팁 (기준일, 데이터 출처)
- 변동 키워드 행 클릭 → S-003 Keyword Detail로 이동
- 데이터 수집 상태 배지 클릭 → 수집 상태 상세 팝오버 (출처별 성공/실패/시각)
- ASO 점수 프로그레스 바 클릭 → 센서타워 출처 안내 툴팁

#### User Tasks

| Task ID | Task | Source | Priority |
|---|---|---|---|
| T-S001-01 | KPI 카드에서 전일 대비 주요 지표 변동 확인 | F-001 Step 1-2 | primary |
| T-S001-02 | 주요 변동 목록에서 하락 키워드 식별 및 클릭 | F-001 Step 3 | primary |
| T-S001-03 | 데이터 수집 상태(성공/실패, 시각) 확인 | F-001 Step 2 | secondary |
| T-S001-04 | ASO 점수 목표 달성률 확인 | F-004 Step 1 | secondary |
| T-S001-05 | 주간 하이라이트에서 상승/하락 Top 키워드 요약 확인 | F-004 Step 2 | secondary |

---

### S-002: Keywords

**Source**: NEW
**References**: none

**Purpose**: 모든 모니터링 키워드의 랭킹, 다운로드, CVR을 통합 테이블로 표시하는 핵심 화면. 주력(방어)/보조(확장) 탭 분류로 키워드 전략 체계화. 민지와 준호의 주요 작업 화면.

**Data Requirements**:

- 키워드 테이블: 키워드명, 분류(주력/보조/미분류), 현재 랭킹, 전일 대비 변동, 7일 스파크라인, 트래픽 점수, iOS 다운로드, iOS CVR, 경쟁사 랭킹(P1)
- 분류 탭 데이터: 전체/주력/보조/미분류별 키워드 수
- 검색/필터: 키워드명, 분류, 변동 크기, 트래픽 점수

#### State Variations

- **Empty**: "키워드를 추가하여 모니터링을 시작하세요" + 키워드 추가 CTA
- **Loading**: 테이블 스켈레톤 (10행 플레이스홀더)
- **Error**: 에러 인라인 메시지 + 이전 데이터 유지 (Stale 경고)
- **Populated**: 분류 탭 + 데이터 테이블 + 정렬/필터 바
- **Filtered Empty**: "조건에 맞는 키워드가 없습니다. 필터를 변경해보세요"

#### Layout

**Type**: single-column

| Section | Position | Content Elements | Behavior |
|---|---|---|---|
| Page Header | top | "Keywords" 타이틀 + 데이터 수집 상태 배지 + 키워드 추가 버튼 | sticky |
| Classification Tabs | below header | 전체 (30) / 주력(방어) (7) / 보조(확장) (20+) / 미분류 (3) | sticky, 탭 전환 시 테이블 필터 |
| Search & Filter Bar | below tabs | 키워드 검색 입력 + 변동 크기 필터 + 트래픽 점수 필터 + 정렬 드롭다운 | sticky |
| Data Table | center, flex-1 | 키워드 행 × 지표 컬럼, 첫 컬럼(키워드명) 고정, 헤더 고정 | scrollable (가로+세로), sticky header + first column |
| Classification Criteria Info | collapsible panel | "방어 키워드: 수학, 문제, 풀이..." / "확장 키워드 기준: 트래픽 3.0+..." | 접힘/펼침 토글 |

#### Key Interactions

- 탭 클릭 → 해당 분류 키워드만 필터링
- 컬럼 헤더 클릭 → 오름차순/내림차순 정렬
- 키워드 행 클릭 → S-003 Keyword Detail
- 키워드 행 우클릭 또는 더보기(...) → 컨텍스트 메뉴 (분류 변경, 삭제)
- 분류 변경 클릭 → S-009 Reclassify Modal
- 변동 배지: ↑N (녹색) / ↓N (빨간색) / → (회색) + 툴팁 "전일(YYYY-MM-DD) 대비"
- 7일 스파크라인: 호버 시 일별 값 툴팁

#### User Tasks

| Task ID | Task | Source | Priority |
|---|---|---|---|
| T-S002-01 | 주력/보조 탭으로 키워드 분류별 성과 확인 | F-001 Step 4, REQ-P0-04 | primary |
| T-S002-02 | 전일 대비 변동 배지로 랭킹 변동 스캔 | F-001 Step 4, REQ-P1-02 | primary |
| T-S002-03 | 특정 키워드 행 클릭하여 상세 추이 드릴다운 | F-001 Step 5 | primary |
| T-S002-04 | 검색/필터로 관심 키워드 빠른 탐색 | REQ-P0-03 | secondary |
| T-S002-05 | 키워드 분류 변경 (주력↔보조) | REQ-P0-04 | secondary |
| T-S002-06 | 채택된 신규 키워드 보조 탭에서 확인 | F-002 Step 6 | secondary |

---

### S-003: Keyword Detail

**Source**: NEW
**References**: none

**Purpose**: 특정 키워드의 30일 랭킹 추이, 다운로드, CVR을 차트로 시각화하고 경쟁사 비교를 제공하는 드릴다운 화면. Slack 딥링크의 랜딩 페이지이기도 함.

**Data Requirements**:

- 키워드 기본 정보: 키워드명, 분류, 트래픽 점수
- 랭킹 추이: 30일 일별 랭킹 라인 차트
- 다운로드 추이: 30일 일별 iOS 다운로드 바 차트
- CVR 추이: 30일 일별 CVR 라인 차트
- 경쟁사 비교 (P1): 동일 키워드에서 콴다 + 경쟁사 4개 랭킹 오버레이
- 현재 지표: 현재 랭킹, 전일 대비, 7일 평균, 30일 평균

#### State Variations

- **Loading**: 차트 스켈레톤 + 지표 카드 스켈레톤
- **Error**: "키워드 데이터를 불러올 수 없습니다" + 재시도 버튼
- **Populated**: 지표 카드 + 차트 3종 + 경쟁사 비교

#### Layout

**Type**: single-column (스크롤)

| Section | Position | Content Elements | Behavior |
|---|---|---|---|
| Page Header | top | 브레드크럼 (Keywords > {키워드명}) + 분류 배지 + 트래픽 점수 | sticky |
| KPI Cards Row | below header | 현재 랭킹, 전일 대비, 7일 평균, 30일 평균 — 4개 카드 | fixed within view |
| Ranking Trend Chart | center | 30일 라인 차트 (X: 날짜, Y: 랭킹) + 경쟁사 오버레이 토글 | scrollable, 차트 인터랙션 |
| Download & CVR Chart | below ranking | 복합 차트: 다운로드(바) + CVR(라인) | scrollable |
| Competitor Comparison | bottom | 경쟁사별 현재 랭킹 테이블 + 30일 추이 비교 | scrollable, P1 |
| Data Source Footer | bottom | 데이터 출처 레이블, 기준일, 플랫폼(iOS/Android) 구분 | fixed |

#### Key Interactions

- 차트 호버 → 해당 일자 수치 툴팁
- 경쟁사 오버레이 토글 (체크박스로 표시할 경쟁사 선택)
- 기간 선택기: 7일 / 30일 / 90일
- 브레드크럼 "Keywords" 클릭 → S-002로 복귀

#### User Tasks

| Task ID | Task | Source | Priority |
|---|---|---|---|
| T-S003-01 | 30일 랭킹 추이 차트에서 하락/상승 시점 확인 | F-001 Step 5, F-003 Step 2 | primary |
| T-S003-02 | CVR + 다운로드 교차 분석 (랭킹 변동과 연관성) | F-001 Step 5, F-003 Step 3 | primary |
| T-S003-03 | 경쟁사 동일 키워드 랭킹 비교 | F-003 Step 4, REQ-P1-03 | secondary |
| T-S003-04 | 기간 변경 (7일/30일/90일) 으로 장기 트렌드 파악 | REQ-P0-03 | secondary |

---

### S-004: Suggestions

**Source**: NEW
**References**: none

**Purpose**: 트래픽 점수 3.0+, 콴다 연관성 기준으로 자동 스크리닝된 키워드 후보를 표시하고 채택 플로우를 제공하는 화면. 준호의 핵심 작업 화면.

**Data Requirements**:

- 제안 키워드 테이블: 키워드명, 트래픽 점수, 콴다 현재 랭킹, 연관 카테고리, 모니터링 상태, 채택 버튼
- 필터: 트래픽 점수 범위 (기본 3.0+), 카테고리 (ai 관련, 학습 관련 등), 콴다 순위 범위
- 기준 설명 패널: 방어/확장 기준 텍스트

#### State Variations

- **Empty**: "현재 기준에 맞는 새 키워드가 없습니다. 기준을 조정해보세요" + 필터 CTA
- **Loading**: 제안 생성 중 프로그레스 ("키워드 스크리닝 중...")
- **Error**: 스크리닝 실패 에러 + 재시도 버튼
- **Populated**: 제안 목록 + "N개 키워드 발견" 요약
- **All Adopted**: "제안된 모든 키워드가 이미 모니터링 중입니다"

#### Layout

**Type**: single-column

| Section | Position | Content Elements | Behavior |
|---|---|---|---|
| Page Header | top | "Suggestions" 타이틀 + 제안 수 배지 + 기준 설명 토글 | sticky |
| Criteria Info Panel | below header | 방어 키워드 기준 + 확장 키워드 기준 텍스트 | 접힘/펼침 토글 |
| Filter Bar | below criteria | 트래픽 점수 범위, 카테고리, 콴다 순위 범위 필터 | sticky |
| Suggestion Table | center, flex-1 | 키워드 행 × (키워드명, 트래픽, 콴다 랭킹, 경쟁사 랭킹, 상태, 채택) | scrollable, sticky header |

#### Key Interactions

- 필터 변경 → 제안 목록 실시간 갱신
- 이미 모니터링 중 키워드 → "모니터링 중" 배지 (채택 버튼 비활성화)
- "채택" 버튼 클릭 → S-008 Adopt Modal
- 기준 설명 토글 → 접힘/펼침 애니메이션

#### User Tasks

| Task ID | Task | Source | Priority |
|---|---|---|---|
| T-S004-01 | 트래픽 기준 필터 적용하여 후보 키워드 목록 탐색 | F-002 Step 1-2 | primary |
| T-S004-02 | 후보 키워드의 트래픽 점수, 콴다 랭킹, 경쟁사 랭킹 비교 검토 | F-002 Step 3 | primary |
| T-S004-03 | 후보 키워드 "채택" 버튼으로 모니터링 목록에 추가 | F-002 Step 4 | primary |
| T-S004-04 | 기준 설명 패널에서 방어/확장 기준 참조 | REQ-P0-05 | secondary |

---

### S-005: Competitors

**Source**: NEW
**References**: none

**Purpose**: 말해보카, 스픽, 듀오링고, 찰칵과 동일 키워드 랭킹을 비교하는 화면. (P1)

**Data Requirements**:

- 경쟁사 비교 테이블: 키워드명, 콴다 랭킹, 말해보카, 스픽, 듀오링고, 찰칵 랭킹
- 경쟁사 선택 필터: 표시할 경쟁사 체크박스
- 데이터 출처 레이블: "센서타워 추정치 기준"

#### State Variations

- **Empty**: "모니터링 키워드를 먼저 추가하세요" + Keywords CTA
- **Loading**: 테이블 스켈레톤
- **Error**: "경쟁사 데이터를 불러올 수 없습니다" + 재시도
- **Populated**: 경쟁사 비교 테이블 + 경쟁사 색상 범례

#### Layout

**Type**: single-column

| Section | Position | Content Elements | Behavior |
|---|---|---|---|
| Page Header | top | "Competitors" 타이틀 + 경쟁사 선택 체크박스 + 출처 레이블 | sticky |
| Comparison Table | center, flex-1 | 키워드 × 경쟁사 랭킹 매트릭스, 색상 코딩 (콴다=Key, 경쟁사=각 색상) | scrollable, sticky header + first column |
| Legend | top-right | 경쟁사별 색상 범례 | fixed |

#### Key Interactions

- 경쟁사 체크박스 토글 → 해당 컬럼 표시/숨김
- 키워드 행 클릭 → S-003 Keyword Detail
- 컬럼 정렬 (랭킹순)

#### User Tasks

| Task ID | Task | Source | Priority |
|---|---|---|---|
| T-S005-01 | 동일 키워드에서 콴다 vs 경쟁사 랭킹 비교 | REQ-P1-03 | primary |
| T-S005-02 | 경쟁사 선택으로 비교 대상 커스터마이징 | REQ-P1-03 | secondary |

---

### S-006: Reports

**Source**: NEW
**References**: none

**Purpose**: 자동 생성된 주간 요약 리포트를 열람하고 Slack/PDF로 공유하는 화면. (P1) 재현(PM)의 핵심 소비 화면.

**Data Requirements**:

- 리포트 목록: 주차별 리포트 리스트 (생성일, 기간, 제목)
- 리포트 상세: 상승 Top 3, 하락 Top 3, KPI 요약 카드, ASO 점수 현황, 주력/보조 성과 요약
- 공유 옵션: Slack Webhook, PDF 다운로드

#### State Variations

- **No Report**: "아직 생성된 리포트가 없습니다" + 데이터 수집 시작일 안내
- **Loading**: 리포트 로딩 스켈레톤
- **Error**: "리포트 생성 실패" + 재시도
- **Populated**: 리포트 목록 + 선택된 리포트 상세

#### Layout

**Type**: split-view (목록 + 상세)

| Section | Position | Content Elements | Behavior |
|---|---|---|---|
| Page Header | top | "Reports" 타이틀 | sticky |
| Report List | left (narrow) | 주차별 리포트 항목 (기간, 요약 한줄) | scrollable, 선택 시 하이라이트 |
| Report Detail | right (wide) | 하이라이트 섹션 + KPI 카드 + 성과 요약 테이블 | scrollable |
| Share Bar | top-right of detail | "Slack으로 공유" + "PDF 다운로드" 버튼 | fixed within detail |

#### Key Interactions

- 리포트 항목 클릭 → 우측 상세 패널에 해당 리포트 표시
- "Slack으로 공유" → Slack 채널 선택 → 전송 확인 토스트
- "PDF 다운로드" → PDF 생성 → 다운로드

#### User Tasks

| Task ID | Task | Source | Priority |
|---|---|---|---|
| T-S006-01 | 최신 주간 리포트에서 핵심 성과 지표 확인 | F-004 Step 3, REQ-P1-04 | primary |
| T-S006-02 | 리포트를 Slack 또는 PDF로 공유 | F-004 Step 4, REQ-P1-04 | primary |
| T-S006-03 | 이전 주간 리포트 비교 열람 | REQ-P1-04 | secondary |

---

### S-007: Settings

**Source**: NEW
**References**: none

**Purpose**: Slack 알림 설정, 데이터 수집 상태 모니터링, 키워드 분류 기준 관리를 제공하는 설정 화면.

**Data Requirements**:

- Slack 설정: Webhook URL, 연결 상태, 알림 임계값 (기본 ±3위), 알림 대상 (전체/주력/보조)
- 데이터 수집 상태: 출처별 (센서타워, ASC) 마지막 수집 시각, 성공/실패 이력
- 분류 기준: 방어 키워드 목록, 확장 키워드 기준 텍스트

#### State Variations

- **Connected**: Slack 연결됨 (채널명 + 초록 배지)
- **Disconnected**: Slack 미연결 (경고 + 연결 CTA)
- **Loading**: 설정 로딩 스켈레톤

#### Layout

**Type**: single-column (섹션별 카드)

| Section | Position | Content Elements | Behavior |
|---|---|---|---|
| Page Header | top | "Settings" 타이틀 | sticky |
| Slack Alert Settings | first card | Webhook URL 입력 + 임계값 슬라이더 (±3위) + 대상 라디오 + 테스트 버튼 | 카드 내 폼 |
| Data Collection Status | second card | 출처별 상태 표, 마지막 수집 시각, 실패 로그 | 카드 내 테이블 |
| Classification Criteria | third card | 방어 키워드 목록 편집 + 확장 기준 편집 | 카드 내 편집 폼 |

#### Key Interactions

- Webhook URL 입력 → "테스트 발송" 버튼 → 성공/실패 토스트
- 임계값 슬라이더 조정 → 자동 저장
- 분류 기준 편집 → 저장 버튼 → 확인 토스트

#### User Tasks

| Task ID | Task | Source | Priority |
|---|---|---|---|
| T-S007-01 | Slack Webhook URL 연결 및 알림 설정 | REQ-P1-01 | primary |
| T-S007-02 | 알림 임계값(±N위) 조정 | REQ-P1-01 | secondary |
| T-S007-03 | 데이터 수집 상태 및 실패 이력 확인 | REQ-P0-01 | secondary |
| T-S007-04 | 키워드 분류 기준(방어/확장) 편집 | REQ-P0-04 | secondary |

---

### S-008: Adopt Modal

**Source**: NEW
**References**: none

**Purpose**: 제안 키워드 채택 시 주력(방어)/보조(확장) 분류를 선택하는 모달.

**Data Requirements**:

- 채택 대상 키워드: 키워드명, 트래픽 점수
- 분류 옵션: 주력(방어), 보조(확장)

#### State Variations

- **Default**: 분류 선택 라디오 버튼 + 확인/취소
- **Submitting**: 확인 버튼 로딩 상태
- **Success**: 토스트 "'{키워드}' 키워드가 보조(확장)로 추가되었습니다" + 모달 닫힘

#### Layout

**Type**: modal (centered, 400px width)

| Section | Position | Content Elements | Behavior |
|---|---|---|---|
| Modal Header | top | "키워드 추가" 타이틀 + 닫기(X) 버튼 | fixed |
| Keyword Info | below header | 키워드명 + 트래픽 점수 배지 | fixed |
| Classification Select | center | 라디오: "주력(방어) 키워드로 추가" / "보조(확장) 키워드로 추가" | |
| Action Buttons | bottom | "취소" (secondary) + "추가" (primary) | fixed |

#### Key Interactions

- 분류 라디오 선택 → "추가" 버튼 활성화
- "추가" 클릭 → submitting → success 토스트 → 모달 닫힘 → S-004 목록 갱신
- "취소" 또는 X → 모달 닫힘
- ESC 키 → 모달 닫힘

#### User Tasks

| Task ID | Task | Source | Priority |
|---|---|---|---|
| T-S008-01 | 채택 키워드의 분류(주력/보조) 선택 후 확인 | F-002 Step 5 | primary |

---

### S-009: Reclassify Modal

**Source**: NEW
**References**: none

**Purpose**: 기존 키워드의 분류를 변경(주력↔보조)할 때 확인하는 모달.

**Data Requirements**:

- 대상 키워드: 키워드명, 현재 분류
- 변경 옵션: 주력(방어), 보조(확장), 미분류

#### State Variations

- **Default**: 현재 분류 표시 + 변경할 분류 선택
- **Submitting**: 확인 버튼 로딩
- **Success**: 토스트 "'{키워드}' 분류가 보조(확장)으로 변경되었습니다"

#### Layout

**Type**: modal (centered, 400px width)

| Section | Position | Content Elements | Behavior |
|---|---|---|---|
| Modal Header | top | "분류 변경" 타이틀 + 닫기(X) | fixed |
| Current State | below header | "현재: 주력(방어)" 배지 | fixed |
| New Classification | center | 라디오: 주력(방어) / 보조(확장) / 미분류 | |
| Action Buttons | bottom | "취소" + "변경" | fixed |

#### Key Interactions

- 현재 분류와 다른 옵션 선택 시 "변경" 활성화
- "변경" 클릭 → submitting → success 토스트 → S-002 테이블 갱신

#### User Tasks

| Task ID | Task | Source | Priority |
|---|---|---|---|
| T-S009-01 | 키워드 분류 변경(주력↔보조) 확인 | REQ-P0-04 | primary |

---

## Screen Relationships

### Navigation Graph

```
S-001 (Overview)
  ├── S-002 (Keywords) ← sidebar nav
  │   ├── S-003 (Keyword Detail) ← row click
  │   └── S-009 (Reclassify Modal) ← context menu
  ├── S-003 (Keyword Detail) ← notable change click
  ├── S-004 (Suggestions) ← sidebar nav
  │   └── S-008 (Adopt Modal) ← adopt button
  ├── S-005 (Competitors) ← sidebar nav
  ├── S-006 (Reports) ← sidebar nav
  └── S-007 (Settings) ← sidebar bottom
```

### Modal / Overlay Screens

| Screen ID | Trigger Screen | Trigger Action | Type |
|---|---|---|---|
| S-008 | S-004 | "채택" 버튼 클릭 | Centered modal (400px) |
| S-009 | S-002 | 컨텍스트 메뉴 "분류 변경" | Centered modal (400px) |

---

## Coverage Verification

### Flow Coverage

| Flow ID | Flow Name | Screens in Flow | All Covered |
|---|---|---|---|
| F-001 | 데일리 모닝 키워드 체크 | S-001 → S-002 → S-003 | Yes |
| F-002 | 신규 키워드 발굴 및 채택 | S-004 → S-008 → S-002 | Yes |
| F-003 | 랭킹 급변동 알림 대응 | (Slack) → S-003 | Yes |
| F-004 | PM 성과 자가 조회 | S-001 → S-006 | Yes |
