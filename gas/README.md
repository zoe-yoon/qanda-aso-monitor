# ASO Keyword Monitor — Google Apps Script 데이터 수집

## 구조

```
gas/
├── Config.gs          # API 키, 시트 이름, 키워드 목록 설정
├── SensorTower.gs     # Sensor Tower API 호출 (키워드 랭킹, 트래픽, 경쟁사)
├── AppStoreConnect.gs # App Store Connect API (iOS 다운로드, CVR)
├── GooglePlayConsole.gs # Google Play Console 데이터 (Android 다운로드, CVR)
├── CategoryRank.gs    # 교육 카테고리 추천 순위 수집
├── Main.gs            # 매일 실행되는 메인 함수 + 트리거 설정
├── SheetWriter.gs     # 시트에 데이터 쓰기 유틸리티
└── SlackNotifier.gs   # Slack Webhook 알림 발송
```

## 설정 방법

1. Google Sheets 새 파일 생성
2. 확장 프로그램 > Apps Script 열기
3. 각 .gs 파일 내용을 복사하여 파일 생성
4. `Config.gs`에서 API 키와 설정값 입력
5. `Main.gs`의 `setupDailyTrigger()` 함수 1회 실행 → 매일 오전 9시(KST) 자동 실행

## Google Sheets 시트 구조

| 시트명 | 용도 |
|---|---|
| `Config` | 모니터링 키워드 목록, API 키, 설정값 |
| `iOS_Rankings` | iOS 키워드별 일일 랭킹 |
| `Android_Rankings` | Android 키워드별 일일 랭킹 |
| `iOS_Downloads` | iOS 다운로드/CVR |
| `Android_Downloads` | Android 다운로드/CVR |
| `CategoryRank` | 교육 카테고리 순위 (iOS/Android) |
| `Competitors` | 경쟁사 키워드 랭킹 |
| `Suggestions` | 키워드 제안 (트래픽 점수 기반) |
| `AlertLog` | Slack 알림 발송 이력 |

## 데이터 소스

- **Sensor Tower API**: 키워드 랭킹, 트래픽 점수, 경쟁사 랭킹, 카테고리 순위
- **App Store Connect API**: iOS 다운로드, 전환율 (JWT 인증)
- **Google Play Console**: Android 다운로드, 전환율 (GCS export → BigQuery 또는 직접)
