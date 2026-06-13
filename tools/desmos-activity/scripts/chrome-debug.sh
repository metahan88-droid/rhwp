#!/usr/bin/env bash
# 이미 로그인된 크롬 프로필(hotdel@g.jbedu.kr)을 CDP 9222 디버그 모드로 띄운다.
# Playwright가 connectOverCDP로 이 세션에 붙어 Activity Builder를 자동 조작한다.
#
# Chrome 136+ 정책: '기본 user-data-dir'로는 원격 디버깅이 차단된다.
# 따라서 기존 프로필의 로그인 데이터를 '전용 디렉토리'로 복사해 디버깅을 허용한다.
# (Local State + Default 프로필 복사 → Keychain 기반 쿠키 복호화 유지)
set -euo pipefail

PORT="${CDP_PORT:-9222}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SRC="${HOME}/Library/Application Support/Google/Chrome"      # 기존(로그인된) 프로필
DBG="${HOME}/.desmos-chrome-debug"                            # 디버그 전용 디렉토리
PROFILE="${CHROME_PROFILE:-Profile 1}"                        # hotdel@g.jbedu.kr = Profile 1

# 이미 9222가 열려 있으면 재기동하지 않는다(세션 보존).
if curl -s --max-time 2 "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1; then
  echo "✓ 이미 CDP ${PORT} 디버그 크롬이 떠 있습니다. 재기동하지 않습니다."
  curl -s "http://127.0.0.1:${PORT}/json/version" | tr ',' '\n' | grep -i '"Browser"'
  exit 0
fi

echo "기존 크롬을 종료합니다 (원본 로그인 프로필은 보존됩니다)..."
osascript -e 'quit app "Google Chrome"' 2>/dev/null || true
sleep 2
pkill -x "Google Chrome" 2>/dev/null || true
sleep 1

# 디버그 전용 디렉토리에 로그인 데이터를 동기화(캐시류 제외 → 빠름).
echo "로그인 데이터를 디버그 디렉토리로 동기화: ${DBG} (프로필: ${PROFILE})"
mkdir -p "${DBG}/${PROFILE}"
cp -f "${SRC}/Local State" "${DBG}/Local State" 2>/dev/null || true
rsync -a --delete \
  --exclude 'Cache' --exclude 'Code Cache' --exclude 'GPUCache' \
  --exclude 'Service Worker' --exclude 'DawnGraphiteCache' --exclude 'DawnWebGPUCache' \
  --exclude 'Application Cache' --exclude 'GrShaderCache' --exclude 'ShaderCache' \
  --exclude 'component_crx_cache' --exclude 'extensions_crx_cache' \
  "${SRC}/${PROFILE}/" "${DBG}/${PROFILE}/" 2>/dev/null || \
  cp -R "${SRC}/${PROFILE}/." "${DBG}/${PROFILE}/" 2>/dev/null || true

echo "디버그 모드로 기동 (포트 ${PORT}, 프로필 '${PROFILE}')..."
"${CHROME}" \
  --remote-debugging-port="${PORT}" \
  --user-data-dir="${DBG}" \
  --profile-directory="${PROFILE}" \
  --no-first-run --no-default-browser-check \
  "https://classroom.amplify.com/" \
  >/dev/null 2>&1 &

for i in $(seq 1 30); do
  if curl -s --max-time 1 "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1; then
    echo "✓ CDP ${PORT} 준비 완료."
    curl -s "http://127.0.0.1:${PORT}/json/version" | tr ',' '\n' | grep -i '"Browser"'
    echo ""
    echo "다음: node src/deploy-cdp.mjs --account   (hotdel 로그인 확인)"
    echo "      로그인이 안 풀려 있으면 그 창에서 hotdel@g.jbedu.kr 로 1회 로그인하면 이후 유지됩니다."
    exit 0
  fi
  sleep 0.5
done

echo "✗ ${PORT} 포트가 열리지 않았습니다. 'ps aux | grep Chrome'로 확인 후 재시도하세요." >&2
exit 1
