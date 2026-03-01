#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/theaios/.openclaw/workspace-custom-127-0-0-1-11434"
[ -f "$ROOT/.env" ] && source "$ROOT/.env"
[ -f "$ROOT/.secrets/runtime.env" ] && source "$ROOT/.secrets/runtime.env"

BASE_URL="${OPENCLAW_BASE_URL:-http://127.0.0.1:8000}"
AUTH_MODE="${OPENCLAW_AUTH_MODE:-bearer}"

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
check "/api/v1/agent/healthz"
check "/api/v1/agent/boards"
