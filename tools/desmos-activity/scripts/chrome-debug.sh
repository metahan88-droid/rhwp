#!/usr/bin/env bash
# 이미 로그인된 크롬 프로필(hotdel@g.jbedu.kr)을 CDP 9222 디버그 모드로 띄운다.
# Playwright가 connectOverCDP로 이 세션에 붙어 Activity Builder를 자동 조작한다.
#
# 주의: 같은 프로필을 쓰는 일반 크롬이 떠 있으면 디버그 포트가 안 열린다.
#       이 스크립트는 먼저 기존 크롬을 종료한 뒤 디버그 모드로 재기동한다.
set -euo pipefail

PORT="${CDP_PORT:-9222}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE_DIR="${HOME}/Library/Application Support/Google/Chrome"   # 기존 프로필 그대로(로그인 유지)

# 이미 9222가 열려 있으면 재기동하지 않는다(세션 보존).
if curl -s --max-time 2 "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1; then
  echo "✓ 이미 CDP ${PORT} 디버그 크롬이 떠 있습니다. 재기동하지 않습니다."
  curl -s "http://127.0.0.1:${PORT}/json/version" | sed 's/,/,\n/g' | grep -i browser
  exit 0
fi

echo "기존 크롬을 종료합니다 (로그인 프로필은 보존됩니다)..."
osascript -e 'quit app "Google Chrome"' 2>/dev/null || true
sleep 2
pkill -x "Google Chrome" 2>/dev/null || true
sleep 1

echo "디버그 모드로 재기동 (포트 ${PORT}, 기존 프로필)..."
"${CHROME}" \
  --remote-debugging-port="${PORT}" \
  --user-data-dir="${PROFILE_DIR}" \
  --profile-directory="Default" \
  --restore-last-session \
  >/dev/null 2>&1 &

# 포트가 열릴 때까지 대기
for i in $(seq 1 20); do
  if curl -s --max-time 1 "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1; then
    echo "✓ CDP ${PORT} 준비 완료."
    curl -s "http://127.0.0.1:${PORT}/json/version" | sed 's/,/,\n/g' | grep -i browser
    echo ""
    echo "다음: node src/deploy-cdp.mjs --probe   (계정 확인 + 편집기 실측)"
    exit 0
  fi
  sleep 0.5
done

echo "✗ ${PORT} 포트가 열리지 않았습니다. 크롬이 정상 종료됐는지 확인 후 다시 시도하세요." >&2
exit 1
