# Scope & Metrics: ASO Keyword Monitor

> **Created**: 2026-03-10
> **Phase**: 4 - Scope

---

## MVP Feature Scope

### Must Have (P0)

| Feature | Description | User Value |
|---|---|---|
| 센서타워 데이터 자동 수집 | 센서타워 API/Export를 통해 키워드 랭킹, 트래픽 점수, 카테고리 랭킹 데이터를 데일리 자동 수집하여 Google Sheets에 적재 | 매일 30분~1시간 수기 입력 제거 → Pain Point #1 해결 |
| App Store Connect 데이터 연동 | ASC Analytics API로 iOS 다운로드, 임프레션, CVR 데이터 자동 수집 | iOS 성과 데이터 자동화 → 분산 데이터 소스 통합 |
| 키워드 랭킹/다운로드/CVR 통합 시트 | 키워드별 랭킹 추이, 다운로드 수, CVR을 하나의 시트에서 교차 확인 가능한 통합 뷰 구성 | 데이터 분산으로 통합 분석 불가 → Pain Point #4 해결 |
| 주력/보조 키워드 분류 뷰 | 사용자 정의 기준에 따라 키워드를 주력(방어)과 보조(확장)로 분류하여 별도 시트/탭으로 구분 표시 | 팀 고유 키워드 전략 체계화 |
| 키워드 제안 기능 | 트래픽 점수 3.0+, 콴다 연관성(직접/간접) 기준으로 새로운 부수 키워드 후보를 자동 스크리닝하여 제안 시트에 표시 | 체계적 키워드 발굴 프로세스 부재 → Pain Point #3 해결 |

### Should Have (P1)

| Feature | Description | User Value |
|---|---|---|
| Slack 알림 | 키워드 랭킹 급변동(±3위 이상) 시 Slack 채널에 자동 알림 | 당일 감지 불가 → Pain Point #2 완화 |
| 랭킹 변동 하이라이트 | 전일 대비 랭킹 상승/하락을 색상(녹/적)으로 자동 표시 | 변동 사항 한눈에 파악 |
| 경쟁사 키워드 비교 | 말해보카, 스픽, 듀오링고, 찰칵 등 경쟁 앱의 동일 키워드 랭킹 비교 | 경쟁 대비 포지션 파악 |
| 주간 요약 리포트 | 주 1회 자동 생성되는 핵심 지표 요약 (랭킹 변동 Top 5, CVR 변화 등) | PM/리더 수동 요청 없이 현황 파악 |

### Nice to Have (P2)

| Feature | Description | User Value |
|---|---|---|
| Looker Studio 대시보드 | Google Sheets 데이터를 시각화하는 Looker Studio 연동 | 시각적 트렌드 분석 |
| 다국가 확장 (US/JP/TW/TH) | KR 이외 국가 키워드 데이터 수집 및 별도 시트 구성 | 5개국 통합 관리 |
| Google Play 키워드 데이터 자동화 | Play Console 데이터 수동 CSV 의존 탈피 (AppTweak Export 등 활용) | Android 완전 자동화 |
| AI 기반 키워드 추천 | LLM 활용 키워드 아이디어 생성 및 트렌드 분석 | 더 정교한 키워드 전략 |

### Explicitly Out of Scope

| Item | Reason |
|---|---|
| ASO 메타데이터 직접 수정 (스토어 리스팅 변경) | 모니터링 도구이며 실행 도구가 아님 |
| 리뷰/평점 관리 | 별도 PRD 존재 (26'02 ASO 평점 관리 개선안) |
| 광고 인텔리전스 (Apple Search Ads, Google UAC) | ASO 키워드 모니터링에 집중, 광고는 별도 도구 |
| 커스텀 웹 대시보드 개발 | 오늘 당장 구축 → Google Sheets MVP로 시작 |

---

## Success Metrics

### North Star Metric

**수기 리포팅 시간 제로화**: ASO 담당자가 매일 수기로 데이터를 입력하는 시간이 0분이 되는 것.

이 메트릭은 제품의 핵심 가치(자동화)를 직접 측정하며, 달성 시 담당자의 시간이 전략적 ASO 작업(키워드 최적화, A/B 테스트 등)으로 전환됨.

### Primary Metrics

| Metric | Target | Measurement | Timeframe |
|---|---|---|---|
| 데일리 자동 수집 성공률 | 95% 이상 (일 1회 스케줄 실행) | Google Apps Script 실행 로그 | 구축 후 1주 |
| 모니터링 키워드 수 | 주력 10개 + 보조 20개 이상 | Google Sheets 키워드 시트 행 수 | 구축 당일 |
| 키워드 제안 채택률 | 월 3개 이상 신규 키워드 채택 | 제안 시트 → 주력/보조 이동 추적 | 구축 후 1개월 |
| ASO 점수 개선 | 81% → 85% | 센서타워 ASO Score | 26Y 1Q 내 (3월 말) |

### Secondary Metrics

| Metric | Target | Measurement | Timeframe |
|---|---|---|---|
| 랭킹 변동 감지 → 대응 시간 | 24시간 이내 | Slack 알림 → 액션 시간 추적 | 구축 후 2주 |
| 데이터 정합성 (수기 vs 자동) | 95% 일치율 | 병행 운영 기간 교차 검증 | 구축 후 1주 |
| PM 대시보드 조회 빈도 | 주 3회 이상 | Google Sheets 접근 로그 | 구축 후 2주 |

---

## Risks & Assumptions

### Assumptions

| Assumption | Confidence | Validation Method |
|---|---|---|
| 센서타워 API에서 키워드 랭킹 데이터 조회 가능 | Medium | 센서타워 계정 로그인 후 API 문서 확인 (오늘) |
| 센서타워 API가 기존 구독에 포함 (추가 비용 없음) | Medium | 센서타워 영업팀/계정 설정 확인 |
| App Store Connect API Key 발급 권한 있음 | High | ASC 관리자 계정 확인 |
| Google Apps Script 실행 시간(6분) 내에 전체 데이터 수집 완료 가능 | Medium | 프로토타입 실행 시간 측정 |
| ASO 팀이 Google Sheets 기반 도구를 수용함 | High | 기존에 수기 스프레드시트 사용 중 |

### Risks

| Risk | Category | Probability | Impact | Mitigation |
|---|---|---|---|---|
| 센서타워 API에 키워드 랭킹 엔드포인트 없음 | Technical | Medium | High | 대안: 센서타워 웹 UI에서 CSV 수동 익스포트 → GAS로 자동 파싱, 또는 Scheduled Data Feed 활용 |
| 센서타워 API 추가 비용 발생 | Financial | Medium | Medium | 영업팀 사전 확인, 불가 시 CSV Export + GAS 파싱으로 우회 |
| Google Play 키워드 데이터 자동 수집 불가 | Technical | High | Medium | Android 키워드 데이터는 센서타워 경유로 수집, 스토어 콘솔 데이터는 주 1회 수동 CSV 임포트 |
| GAS 실행 시간 초과 (6분 제한) | Technical | Low | Medium | 데이터 수집을 여러 트리거로 분할 실행 (키워드 수집/랭킹 수집/CVR 수집 별도) |
| API 인증 키 발급 지연 | Operational | Low | High | 오늘 즉시 발급 요청, 불가 시 수동 입력으로 시작하고 API 연동은 추후 |

---

## Timeline & Constraints

### Target Launch

**2026-03-10 (오늘)** - 사용자 요청에 따라 당일 MVP 구축. 완성도보다 속도 우선.

### Milestones

| Milestone | Date | Deliverables |
|---|---|---|
| M0: API 접근 확인 | 2026-03-10 (오전) | 센서타워 API 키워드 엔드포인트 확인, ASC API Key 발급 확인 |
| M1: Google Sheets 구조 설계 | 2026-03-10 (오전) | 시트 탭 구조, 키워드 목록, 데이터 컬럼 설계 완료 |
| M2: 데이터 수집 자동화 구현 | 2026-03-10 (오후) | GAS 스크립트로 센서타워/ASC 데이터 자동 수집 구현 |
| M3: 통합 뷰 + 키워드 분류 + 제안 | 2026-03-10 (오후) | 주력/보조 분류 뷰, 키워드 제안 시트, 조건부 서식 적용 |
| M4: P1 기능 추가 | 2026-03-11~12 | Slack 알림, 경쟁사 비교, 주간 리포트 |
| M5: 안정화 & 검증 | 2026-03-13~14 | 1주 병행 운영, 데이터 정합성 검증, 피드백 반영 |

### Constraints

| Type | Description |
|---|---|
| Budget | $0 (기존 센서타워 구독 + 무료 Google Workspace 활용) |
| Timeline | 오늘(3/10) MVP 구축 필수, 26Y 1Q(3월 말) 내 안정화 |
| Technology | Google Sheets + Google Apps Script, 센서타워 API, App Store Connect API |
| Team | ASO/마케팅 담당자 2-3명 (구축은 1명이 주도, 나머지 검증) |
| Regulatory | N/A |

### Team Resources

- **구축**: Claude (AI) + ASO 담당자 1명 협업
- **검증**: ASO 팀 2-3명이 기존 수기 데이터와 교차 검증
- **승인**: PM/팀 리더 확인
- **External**: 센서타워 지원팀 (API 문의)

---
