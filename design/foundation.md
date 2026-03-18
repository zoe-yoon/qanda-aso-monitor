# Design Foundation: ASO Keyword Monitor

> **Created**: 2026-03-10
> **Phase**: 2 - Foundation

---

## Design Vision

데이터 분산과 수작업 반복에서 벗어나, ASO 팀이 매일 아침 하나의 화면에서 키워드 성과를 즉시 파악하고 전략적 의사결정에 집중할 수 있는 명확하고 신뢰감 있는 모니터링 환경을 만든다.

---

## Design Principles

| Principle | Description |
|---|---|
| Data Trust First | 모든 데이터에 수집 시각, 출처, 상태를 명시한다. "이 데이터가 오늘 것인가?"라는 의문이 생기지 않아야 한다. |
| Scan, Don't Search | 중요한 변동은 색상+아이콘+숫자로 즉시 눈에 띄어야 한다. 사용자가 찾지 않아도 이상치가 먼저 드러난다. |
| Role-Aware Entry | 민지(변동 감지), 준호(키워드 탐색), 재현(요약 열람) — 각 역할의 최우선 정보가 진입 시 바로 보여야 한다. |
| Classification as Structure | 주력(방어)/보조(확장) 키워드 분류가 내비게이션, 필터, 제안의 1차 축이다. |
| Minimum Friction | 키워드 채택, 분류 변경, 리포트 공유 등 핵심 액션은 3클릭 이내에 완료된다. |

---

## Design Approach

**Approach**: desktop-first

**Rationale**: 3명의 사용자 모두 데스크탑 웹 브라우저(Chrome)에서 사무실 근무 중 사용. 데이터 밀도가 높은 테이블 중심 UI이므로 데스크탑 최적화가 핵심. Slack 알림 후 모바일 확인 시나리오는 P2로 후순위.

---

## Brand Guidelines

### Tone & Voice

- **Personality**: 프로페셔널하고 신뢰감 있는 데이터 도구. 감정적 표현을 최소화하고 수치와 팩트 중심.
- **Language Level**: 간결하고 직접적. ASO 도메인 용어(랭킹, CVR, 트래픽 점수) 그대로 사용.
- **Content Style**: 숫자 우선, 설명 최소. 상태 메시지는 "마지막 업데이트 오늘 06:30" 같이 구체적.

### Color Palette

> 시맨틱 토큰 구조 고정. QDS3 기본값 사용.

#### Key Colors (Brand Orange)

| Token | Hex | Source Color | Usage |
|---|---|---|---|
| Key-Background1 | #ed5000 | Orange-50 | 주요 CTA, 브랜드 배경 |
| Key-Background2 | #fef1eb | Orange-100 | 연한 강조 배경 |
| Key-Foreground1 | #fef1eb | Orange-100 | 채워진 배경 위 텍스트 |
| Key-Foreground2 | #ed5000 | Orange-50 | 브랜드색 텍스트, 링크 |
| Key-Stroke1 | #ed5000 | Orange-50 | 실선 테두리 |
| Key-Stroke2 | #fbdccc | Orange-90 | 연한 테두리 |
| Key-on-Neutral-Color | #fa6616 | Orange-60 | 다크 배경 위 브랜드색 |
| Key-Overlay-Hover | rgba(237,80,0,0.1) | - | 호버 오버레이 |
| Key-Overlay-Pressed | rgba(237,80,0,0.3) | - | 프레스 오버레이 |

#### Accent Colors

##### Interactive (Blue)

| Token | Hex | Source Color | Usage |
|---|---|---|---|
| Interactive-Background1 | #0785f2 | Blue-50 | 링크, 인터랙티브 요소 배경 |
| Interactive-Background2 | #ecf6ff | Blue-100 | 연한 인터랙티브 배경 |
| Interactive-Foreground1 | #ecf6ff | Blue-100 | 채워진 배경 위 텍스트 |
| Interactive-Foreground2 | #0785f2 | Blue-50 | 링크 텍스트, 인터랙티브 텍스트 |
| Interactive-Stroke1 | #0785f2 | Blue-50 | 포커스 링, 실선 테두리 |
| Interactive-Stroke2 | #cde7fc | Blue-90 | 연한 테두리 |

##### Negative (Red) — 랭킹 하락 표시에 사용

| Token | Hex | Source Color | Usage |
|---|---|---|---|
| Negative-Background1 | #fb2d36 | Red-50 | 에러, 삭제, 위험 배경 |
| Negative-Background2 | #ffeeef | Red-100 | 연한 에러 배경, 하락 행 배경 |
| Negative-Foreground1 | #ffeeef | Red-100 | 채워진 배경 위 텍스트 |
| Negative-Foreground2 | #fb2d36 | Red-50 | 에러 텍스트, 하락 수치 |
| Negative-Stroke1 | #fb2d36 | Red-50 | 에러 테두리 |
| Negative-Stroke2 | #fed5d7 | Red-90 | 연한 에러 테두리 |

##### Success (Green) — 랭킹 상승 표시에 사용

| Token | Hex | Source Color | Usage |
|---|---|---|---|
| Success-Background1 | #0d9974 | Green-50 | 성공, 확인 배경 |
| Success-Background2 | #ecf7f4 | Green-100 | 연한 성공 배경, 상승 행 배경 |
| Success-Foreground1 | #ecf7f4 | Green-100 | 채워진 배경 위 텍스트 |
| Success-Foreground2 | #0d9974 | Green-50 | 성공 텍스트, 상승 수치 |
| Success-Stroke1 | #0d9974 | Green-50 | 성공 테두리 |
| Success-Stroke2 | #cfebe3 | Green-90 | 연한 성공 테두리 |

##### Notice (Yellow)

| Token | Hex | Source Color | Usage |
|---|---|---|---|
| Notice-Background1 | #ffcc00 | Yellow-50 | 경고, 주의 배경 |
| Notice-Background2 | #fffbeb | Yellow-100 | 연한 경고 배경 |
| Notice-Foreground1 | #322f1b | Yellow-10 | 채워진 배경 위 텍스트 (가독성) |
| Notice-Foreground2 | #666037 | Yellow-20 | 경고 텍스트 (가독성) |
| Notice-Stroke1 | #ffcc00 | Yellow-50 | 경고 테두리 |
| Notice-Stroke2 | #fff5cc | Yellow-90 | 연한 경고 테두리 |

##### Informative (Purple)

| Token | Hex | Source Color | Usage |
|---|---|---|---|
| Informative-Background1 | #7e53e3 | Purple-50 | 정보, 안내 배경 |
| Informative-Background2 | #f5f0fc | Purple-100 | 연한 정보 배경 |
| Informative-Foreground1 | #f5f0fc | Purple-100 | 채워진 배경 위 텍스트 |
| Informative-Foreground2 | #7e53e3 | Purple-50 | 정보 텍스트 |
| Informative-Stroke1 | #7e53e3 | Purple-50 | 정보 테두리 |
| Informative-Stroke2 | #e5ddf9 | Purple-90 | 연한 정보 테두리 |

#### Neutral Scale

| Token | Hex | Usage |
|---|---|---|
| Neutral-0 | #121212 | 가장 어두운 배경 |
| Neutral-10 | #222222 | 기본 텍스트 (Foreground-Primary) |
| Neutral-20 | #3d3d3d | 선택된 테두리 (Stroke-Selected) |
| Neutral-30 | #5d5d5d | 보조 텍스트 (Foreground-Secondary) |
| Neutral-40 | #7a7a7a | 중간 회색 |
| Neutral-50 | #999999 | 3차 텍스트 (Foreground-Tertiary) |
| Neutral-60 | #b5b5b5 | 비활성 텍스트 (Foreground-Disabled) |
| Neutral-70 | #d0d0d0 | 활성 테두리 (Stroke-Active) |
| Neutral-80 | #f0f0f0 | 비활성 테두리, 선택 가능 배경 |
| Neutral-90 | #f9f9f9 | 캔버스 배경 (Background-Canvas) |
| Neutral-100 | #ffffff | 카드 배경 (Background-Card) |

#### Structural Semantic Tokens

| Token | Source | Usage |
|---|---|---|
| Background-Canvas | Neutral-90 (#f9f9f9) | 페이지 전체 배경 |
| Background-Card | Neutral-100 (#ffffff) | 카드, 컨테이너 배경 |
| Background-Selectable1 | Neutral-20 (#3d3d3d) | 선택 가능 진한 배경 |
| Background-Selectable2 | Neutral-80 (#f0f0f0) | 선택 가능 연한 배경 |
| Background-Selectable3 | Neutral-90 (#f9f9f9) | 선택 가능 가장 연한 배경 |
| Background-Neutral-High | #000000 | 최고 대비 배경 |
| Background-Transparent | rgba(34,34,34,0.9) | 반투명 오버레이 배경 |
| Foreground-Primary | Neutral-10 (#222222) | 기본 텍스트 |
| Foreground-Secondary | Neutral-30 (#5d5d5d) | 보조 텍스트 |
| Foreground-Tertiary | Neutral-50 (#999999) | 3차 텍스트, 플레이스홀더 |
| Foreground-Disabled | Neutral-60 (#b5b5b5) | 비활성 텍스트 |
| Foreground-on-Neutral-Color | Neutral-90 (#f9f9f9) | 어두운 배경 위 텍스트 |
| Foreground-on-Accent-Color | Neutral-90 (#f9f9f9) | 컬러 배경 위 텍스트 |
| Stroke-Selected | Neutral-20 (#3d3d3d) | 선택된 상태 테두리 |
| Stroke-Active | Neutral-70 (#d0d0d0) | 활성 테두리 |
| Stroke-Inactive | Neutral-80 (#f0f0f0) | 비활성 테두리 |
| Overlay-Dimmed | rgba(0,0,0,0.5) | 모달 뒤 딤 |
| Overlay-Disabled | rgba(255,255,255,0.5) | 비활성 오버레이 |
| Overlay-Hover | rgba(0,0,0,0.03) | 호버 오버레이 |
| Overlay-Pressed | rgba(0,0,0,0.1) | 프레스 오버레이 |

### Typography

**Font Family**: `Pretendard Std, Pretendard JP, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif`
**Font Asset**: `https://assets.qanda.ai/common-assets/fonts/pretendard/pretendard-std.css`
**Font Feature Settings**: `'calt' 1, 'tnum' 1, 'ss03' 1, 'ss10' 1`

| Style | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| LargeTitle | 28px | 700 | 36px | 페이지 히어로 |
| Title1 | 24px | 700 | 32px | 페이지 타이틀 |
| Title2 | 20px | 700 | 28px | 섹션 헤더 |
| Headline | 16px | 600 | 24px | 서브섹션 헤더 |
| Headline_Strong | 16px | 700 | 24px | 카드 헤더, KPI 수치 |
| Body | 16px | 400 | 24px | 기본 본문 |
| Body_Strong | 16px | 600 | 24px | 강조 본문 |
| Subheadline | 14px | 400 | 20px | 테이블 셀 텍스트 |
| Subheadline_Strong | 14px | 600 | 20px | 테이블 헤더, 버튼 텍스트 |
| Footnote | 13px | 400 | 18px | 작은 주석, 출처 레이블 |
| Footnote_Strong | 13px | 600 | 18px | 강조 주석 |
| Caption1 | 12px | 400 | 16px | 배지 텍스트, 메타데이터 |
| Caption1_Strong | 12px | 600 | 16px | 강조 배지 |
| Caption2 | 11px | 500 | 16px | 최소 텍스트 |
| Caption2_Strong | 11px | 600 | 16px | 강조 최소 텍스트 |

### Iconography

- **Style**: outlined
- **Sizes**: 16px (inline/배지), 20px (버튼/테이블 액션), 24px (내비게이션), 32px (빈 상태 일러스트)
- **Library**: Lucide Icons (경량, MIT 라이선스, React 지원)
- **Consistency Rule**: 1.5px stroke weight, round line join/cap

### Spacing System

- **Base Unit**: 4px

| Token | Value | Usage |
|---|---|---|
| space-0 | 0px | No spacing |
| space-1 | 4px | 인라인 아이콘-텍스트 간격 |
| space-2 | 8px | 배지 내부 패딩, 밀접한 요소 간격 |
| space-3 | 12px | 테이블 셀 패딩 |
| space-4 | 16px | 카드 내부 패딩, 섹션 내 요소 간격 |
| space-5 | 20px | 카드 패딩 (상하) |
| space-6 | 24px | 섹션 간 간격 |
| space-8 | 32px | 큰 섹션 간격 |
| space-10 | 40px | 페이지 수준 간격 |
| space-12 | 48px | 사이드바 패딩 |
| space-16 | 64px | 주요 레이아웃 구분 |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| rounded-none | 0px | 테이블 셀 |
| rounded-sm | 4px | 배지, 태그 |
| rounded | 8px | 기본 카드, 버튼 |
| rounded-lg | 12px | 큰 카드, 모달 |
| rounded-xl | 16px | 팝오버, 드로어 |
| rounded-full | 9999px | 상태 점, 아바타 |

### Shadows

| Token | Value | Usage |
|---|---|---|
| shadow-1 | 0px 2px 16px 0px rgba(0,0,0,0.03) | 카드 기본 (subtle lift) |
| shadow-2 | 0px 4px 16px 0px rgba(0,0,0,0.12), 0px 0px 1px 0px rgba(0,0,0,0.08) | 모달, 팝오버 |

---

## Design Decisions Log

| Decision | Rationale | Date |
|---|---|---|
| Desktop-first approach | 3명 전원 데스크탑 사무실 사용, 데이터 밀도 높은 테이블 UI | 2026-03-10 |
| QDS3 Orange 기본값 유지 | 콴다 내부 도구 → 브랜드 일관성 유지 | 2026-03-10 |
| Pretendard 폰트 사용 | QDS3 기본, 한글/영문/숫자 가독성 우수, tabular nums 지원 | 2026-03-10 |
| Lucide Icons 선택 | 경량, outlined 스타일이 데이터 대시보드에 적합, React 호환 | 2026-03-10 |
| 랭킹 변동에 Success/Negative 토큰 사용 | 상승=Green(Success), 하락=Red(Negative)로 직관적 매핑, WCAG 준수를 위해 아이콘+숫자 병행 | 2026-03-10 |
| 4px base spacing | 테이블 셀 등 밀도 높은 레이아웃에 세밀한 간격 제어 필요 | 2026-03-10 |
