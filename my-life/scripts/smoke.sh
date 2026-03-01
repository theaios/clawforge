#!/usr/bin/env bash
set -euo pipefail

echo "[smoke] backend health"
curl -fsS http://localhost:8787/health >/dev/null
echo "ok"

echo "[smoke] backend projects"
curl -fsS http://localhost:8787/api/projects | head -c 120 && echo

echo "[smoke] frontend health"
curl -fsS http://localhost:3001 >/dev/null
echo "ok"

echo "Smoke checks passed"
