#!/bin/bash
# ASO 키워드 모니터 — 매일 자동 수집 & 배포
# 맥북 열 때 (로그인/wake) + 매일 10:00에 실행
# 오늘 데이터가 이미 있으면 스킵
# 오류 시 1시간 후 재시도 (오전 중 최대 3회)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRAPER_DIR="$SCRIPT_DIR"
MOCKUP_DIR="$SCRIPT_DIR/../mockup"
LOG_DIR="$SCRAPER_DIR/logs"
TODAY=$(date +%Y-%m-%d)
LOG_FILE="$LOG_DIR/daily-$TODAY.log"
DATA_FILE="$SCRAPER_DIR/data/st-$TODAY.json"
RETRY_FILE="$LOG_DIR/.retry-count-$TODAY"

# 오늘 데이터가 이미 수집되었으면 스킵
if [ -f "$DATA_FILE" ]; then
  echo "[$(date +%H:%M:%S)] 오늘($TODAY) 데이터 이미 존재 → 스킵"
  exit 0
fi

# 재시도 횟수 확인 (최대 3회)
RETRY_COUNT=0
if [ -f "$RETRY_FILE" ]; then
  RETRY_COUNT=$(cat "$RETRY_FILE")
fi
if [ "$RETRY_COUNT" -ge 3 ]; then
  echo "[$(date +%H:%M:%S)] 오늘 재시도 3회 초과 → 스킵"
  exit 0
fi

# Slack 알림 함수
notify() {
  local type="$1"
  shift
  cd "$SCRAPER_DIR"
  node src/notify-slack.js "$type" "$@" 2>&1 || echo "[Slack] 알림 전송 실패 (webhook 미설정?)"
}

# 1시간 후 재시도 예약
schedule_retry() {
  local next_count=$((RETRY_COUNT + 1))
  echo "$next_count" > "$RETRY_FILE"
  local delay=3600 # 1시간
  echo "[$(date +%H:%M:%S)] 재시도 $next_count/3 예약 (1시간 후)"
  (sleep $delay && bash "$SCRIPT_DIR/daily-collect.sh") &
  disown
}

# 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

# 로그 시작
exec > >(tee -a "$LOG_FILE") 2>&1
echo "=== ASO Daily Collect: $TODAY $(date +%H:%M:%S) (시도 $((RETRY_COUNT + 1))/3) ==="

# PATH 설정 (node, npx 등)
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls $HOME/.nvm/versions/node/ 2>/dev/null | tail -1)/bin:$PATH"

# 1. Sensor Tower 데이터 수집
echo "[1/4] Sensor Tower 데이터 수집..."
cd "$SCRAPER_DIR"
if node src/collect.js 2>&1; then
  echo "  ✅ 수집 성공"
else
  EXIT_CODE=$?
  echo "  ❌ 수집 실패 (exit: $EXIT_CODE)"

  # 로그에서 세션 만료 여부 확인
  if grep -q "세션이 만료" "$LOG_FILE" 2>/dev/null || grep -q "sign_in" "$LOG_FILE" 2>/dev/null; then
    notify "session-expired"
    # 세션 만료는 재시도해도 안 되므로 바로 종료
    exit 1
  else
    notify "error" "수집 실패 (시도 $((RETRY_COUNT + 1))/3, exit: $EXIT_CODE)"
    schedule_retry
  fi
  exit 1
fi

# 2. mockData.ts 생성
echo "[2/4] mockData.ts 생성..."
if node src/generate-mockdata.js 2>&1; then
  echo "  ✅ mockData 생성 성공"
else
  echo "  ❌ mockData 생성 실패"
  notify "error" "mockData 생성 실패 (시도 $((RETRY_COUNT + 1))/3)"
  schedule_retry
  exit 1
fi

# 3. 빌드
echo "[3/4] Mockup 빌드..."
cd "$MOCKUP_DIR"
if npm run build 2>&1; then
  echo "  ✅ 빌드 성공"
else
  echo "  ❌ 빌드 실패"
  notify "error" "빌드 실패 (시도 $((RETRY_COUNT + 1))/3)"
  schedule_retry
  exit 1
fi

# 4. Vercel 배포
echo "[4/4] Vercel 배포..."
if npx vercel --prod --yes 2>&1; then
  echo "  ✅ 배포 성공"
else
  echo "  ❌ 배포 실패"
  notify "error" "Vercel 배포 실패 (시도 $((RETRY_COUNT + 1))/3)"
  schedule_retry
  exit 1
fi

echo ""
echo "=== 완료: $(date +%H:%M:%S) ==="

# 성공 — 재시도 파일 정리
rm -f "$RETRY_FILE"

# 성공 알림
cd "$SCRAPER_DIR"
notify "success"

# 오래된 로그 정리 (30일 이상)
find "$LOG_DIR" -name "daily-*.log" -mtime +30 -delete 2>/dev/null || true
find "$LOG_DIR" -name ".retry-count-*" -mtime +1 -delete 2>/dev/null || true
