#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/theaios/.openclaw/workspace-custom-127-0-0-1-11434"
[ -f "$ROOT/.env" ] && source "$ROOT/.env"
[ -f "$ROOT/.secrets/runtime.env" ] && source "$ROOT/.secrets/runtime.env"

BASE_URL="${OPENCLAW_BASE_URL:-http://127.0.0.1:8000}"
AUTH_MODE="${OPENCLAW_AUTH_MODE:-bearer}"
# Canonical QA mode for Mission Control app should validate user-path boards APIs.
# Optional agent-path checks can be enabled via CHECK_AGENT_ENDPOINTS=1.
CHECK_AGENT_ENDPOINTS="${CHECK_AGENT_ENDPOINTS:-0}"

bearer="${OPENCLAW_BEARER_TOKEN:-}"
agent="${OPENCLAW_AGENT_TOKEN:-}"
apikey="${OPENCLAW_API_KEY:-}"

headers=()
case "$AUTH_MODE" in
  bearer)
    [ -n "$bearer" ] && headers+=( -H "Authorization: Bearer $bearer" )
    ;;
  x-agent-token)
    [ -n "$agent" ] && headers+=( -H "X-Agent-Token: $agent" )
    ;;
  x-api-key)
    [ -n "$apikey" ] && headers+=( -H "x-api-key: $apikey" )
    ;;
  both)
    [ -n "$bearer" ] && headers+=( -H "Authorization: Bearer $bearer" )
    [ -n "$agent" ] && headers+=( -H "X-Agent-Token: $agent" )
    ;;
  auto)
    [ -n "$bearer" ] && headers+=( -H "Authorization: Bearer $bearer" )
    [ -n "$agent" ] && headers+=( -H "X-Agent-Token: $agent" )
    [ -n "$apikey" ] && headers+=( -H "x-api-key: $apikey" )
    ;;
  *)
    echo "Unknown OPENCLAW_AUTH_MODE=$AUTH_MODE"; exit 2
    ;;
esac

check() {
  local path="$1"
  local code
  code=$(curl -sS -o /tmp/oc-auth-check.body -w "%{http_code}" "${headers[@]}" "$BASE_URL$path" || true)
  echo "$path => $code"
}

check "/healthz"
check "/api/v1/boards"

# Probe first board tasks endpoint to verify end-to-end user-path access.
boards_json=$(curl -sS "${headers[@]}" "$BASE_URL/api/v1/boards" || true)
board_id=$(python3 -c 'import json,sys
try:
  j=json.loads(sys.stdin.read() or "{}")
  items=j.get("items") or []
  print(items[0].get("id","") if items else "")
except Exception:
  print("")' <<< "$boards_json")
if [ -n "$board_id" ]; then
  check "/api/v1/boards/$board_id/tasks"
else
  echo "/api/v1/boards/{BOARD_ID}/tasks => skipped (no board id found)"
fi

if [ "$CHECK_AGENT_ENDPOINTS" = "1" ]; then
  check "/api/v1/agent/healthz"
  check "/api/v1/agent/boards"
fi
