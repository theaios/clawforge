#!/usr/bin/env bash
set -euo pipefail
APP_DIR="/home/theaios/.openclaw/workspace-custom-127-0-0-1-11434/my-life"
LOG="$APP_DIR/run.log"

if ! pgrep -f "node $APP_DIR/server.js" >/dev/null 2>&1; then
  cd "$APP_DIR"
  nohup npm start >> "$LOG" 2>&1 &
fi
