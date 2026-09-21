#!/usr/bin/env bash
# Pulls the latest changes and starts a local server that's reachable from
# other devices on the same WiFi (not just this machine).
#
# Usage:
#   ./run.sh              # sync + serve current branch on port 8000
#   ./run.sh 3000          # ...on a different port
#   ./run.sh 8000 main     # sync + serve a specific branch

set -euo pipefail
cd "$(dirname "$0")"

PORT="${1:-8000}"
BRANCH="${2:-$(git rev-parse --abbrev-ref HEAD)}"

echo "==> Syncing '$BRANCH' from origin..."
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull origin "$BRANCH"

# Find this machine's LAN IP so it can be shared with other devices.
if command -v ipconfig >/dev/null 2>&1 && [ "$(uname)" = "Darwin" ]; then
  LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")
elif command -v hostname >/dev/null 2>&1; then
  LAN_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi

echo ""
echo "==> Starting server on port $PORT"
echo "    On this machine:  http://localhost:$PORT"
if [ -n "${LAN_IP:-}" ]; then
  echo "    Other devices:    http://$LAN_IP:$PORT"
else
  echo "    (Could not auto-detect your LAN IP - run 'ipconfig' / 'ip addr' to find it.)"
fi
echo "    Press Ctrl+C to stop."
echo ""

if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server "$PORT" --bind 0.0.0.0
elif command -v npx >/dev/null 2>&1; then
  npx --yes serve -l "tcp://0.0.0.0:$PORT"
else
  echo "Need python3 or npx installed to serve the app." >&2
  exit 1
fi
