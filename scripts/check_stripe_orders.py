#!/usr/bin/env python3
import json
import os
import sys
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

STATE_DIR = Path('/home/theaios/.openclaw/workspace-custom-127-0-0-1-11434/state')
STATE_DIR.mkdir(parents=True, exist_ok=True)
STATE_FILE = STATE_DIR / 'stripe-order-state.json'

STRIPE_SECRET = os.getenv('STRIPE_SECRET_KEY', '').strip()
if not STRIPE_SECRET:
    key_file = Path('/home/theaios/.openclaw/workspace-custom-127-0-0-1-11434/.secrets/stripe_secret.key')
    if key_file.exists():
        STRIPE_SECRET = key_file.read_text().strip()
if not STRIPE_SECRET:
    print('ERROR: STRIPE_SECRET_KEY missing')
    sys.exit(2)

if STATE_FILE.exists():
    state = json.loads(STATE_FILE.read_text())
else:
    state = {'last_check': int(time.time()) - 3600, 'seen_session_ids': []}

last_check = int(state.get('last_check', int(time.time()) - 3600))
seen = set(state.get('seen_session_ids', []))

params = {
    'limit': 50,
    'created[gte]': max(last_check - 120, 0),
}
url = 'https://api.stripe.com/v1/checkout/sessions?' + urlencode(params)
req = Request(url, headers={'Authorization': f'Bearer {STRIPE_SECRET}'})

with urlopen(req, timeout=20) as resp:
    payload = json.loads(resp.read().decode())

new_paid = []
for s in payload.get('data', []):
    sid = s.get('id')
    if not sid or sid in seen:
        continue
    if s.get('status') == 'complete' and s.get('payment_status') == 'paid':
        new_paid.append({
            'id': sid,
            'email': s.get('customer_details', {}).get('email') or 'unknown',
            'amount_total': s.get('amount_total', 0),
            'currency': (s.get('currency') or 'usd').upper(),
            'created': s.get('created'),
            'url': s.get('url'),
        })
    seen.add(sid)

state['last_check'] = int(time.time())
# keep seen IDs bounded
state['seen_session_ids'] = list(seen)[-500:]
STATE_FILE.write_text(json.dumps(state, indent=2))

if not new_paid:
    print('NO_NEW_ORDERS')
    sys.exit(0)

for o in sorted(new_paid, key=lambda x: x.get('created', 0)):
    amount = f"${(o['amount_total'] or 0)/100:.2f}"
    print(f"NEW_ORDER|{o['id']}|{amount} {o['currency']}|{o['email']}")
