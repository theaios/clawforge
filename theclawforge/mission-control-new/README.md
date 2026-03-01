# TheClawForge Mission Control (new)

Loaded from uploaded files + developer guide.

## Received files
- 9 standalone screens: Kanban, Agent Army, Agent Configurator, CRM/Sales, Finance, Integrations, Brainstorming, Cost/Usage, Empty States.
- Developer guide PDF (27 pages).

## Missing files (per guide)
Overview, Timeline, Comms Center, Approvals/Blockers, Marketing, Security, Run History, Web/Delivery, Templates, Settings, Key Modals, Combined app shell.

## Run
npm install
npm run dev

Preview URL: http://localhost:8088

## Live OpenClaw API setup
Copy `.env.example` to `.env` and set values:

- `VITE_OPENCLAW_BASE_URL` — OpenClaw gateway/API base URL
- `VITE_OPENCLAW_AUTH_MODE` — `bearer`, `x-agent-token`, `x-api-key`, `both`, or `auto`
- `VITE_OPENCLAW_BEARER_TOKEN` and/or `VITE_OPENCLAW_AGENT_TOKEN` (plus optional `VITE_OPENCLAW_API_KEY`)
- `VITE_OPENCLAW_ALLOW_LOCAL_FALLBACK` — default `false` (strict live mode)

When configured, core Mission Control actions attempt live API calls first and surface `requestId`/`debugCode` in the UI.
