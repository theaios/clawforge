#!/usr/bin/env python3
"""
Stripe order watcher for OpenClaw cron.

Output contract:
- print "NO_NEW_ORDERS" when nothing new (or when Stripe is not configured)
- print one line per order as:
  NEW_ORDER id=<id> amount=<amount> email=<email>

State file tracks last seen Stripe event created timestamp.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path("/home/theaios/.openclaw/workspace-custom-127-0-0-1-11434")
STATE_DIR = ROOT / "state"
STATE_PATH = STATE_DIR / "stripe-order-state.json"


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        if not k:
            continue
        v = v.strip().strip('"').strip("'")
        os.environ.setdefault(k, v)


def load_state() -> dict:
    if not STATE_PATH.exists():
        return {"last_created": 0}
    try:
        return json.loads(STATE_PATH.read_text())
    except Exception:
        return {"last_created": 0}


def save_state(state: dict) -> None:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, indent=2))


def stripe_get(path: str, params: dict, key: str) -> dict:
    query = urllib.parse.urlencode(params)
    url = f"https://api.stripe.com{path}?{query}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("User-Agent", "openclaw-stripe-watch/1.0")
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))


def main() -> int:
    # Load local env files (non-destructive, do not override existing process env)
    load_env_file(ROOT / ".env")
    load_env_file(ROOT / ".secrets" / "runtime.env")

    key = os.getenv("STRIPE_SECRET_KEY", "").strip()
    if not key:
        # Graceful no-op when key isn't configured yet.
        print("NO_NEW_ORDERS")
        return 0

    state = load_state()
    last_created = int(state.get("last_created", 0))

    try:
        # Pull recent successful checkout sessions (most direct for paid web orders)
        data = stripe_get(
            "/v1/checkout/sessions",
            {
                "limit": 50,
                "expand[]": ["data.customer_details"],
                "payment_status": "paid",
            },
            key,
        )
    except Exception:
        # Keep cron quiet on transient/network/auth failures
        print("NO_NEW_ORDERS")
        return 0

    sessions = data.get("data", []) or []
    new_sessions = [s for s in sessions if int(s.get("created", 0)) > last_created]

    if not new_sessions:
        print("NO_NEW_ORDERS")
        return 0

    new_sessions.sort(key=lambda s: int(s.get("created", 0)))
    newest_created = max(int(s.get("created", 0)) for s in new_sessions)

    for s in new_sessions:
        sid = s.get("id", "unknown")
        cents = s.get("amount_total") or 0
        amount = f"{(cents / 100):.2f}"
        email = ((s.get("customer_details") or {}).get("email") or "unknown").strip() or "unknown"
        print(f"NEW_ORDER id={sid} amount={amount} email={email}")

    save_state({"last_created": newest_created})
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
