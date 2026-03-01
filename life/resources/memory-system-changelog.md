## 2026-02-27
- Enabled OpenClaw memory backend: `qmd` in `~/.openclaw/openclaw.json`.
- Added QMD path indexing for life KB: `life/**/*.md` (name: `life`).
- Enabled sanitized session indexing: `memory.qmd.sessions.enabled = true`.
- Set QMD refresh cadence: `memory.qmd.update.interval = 5m`.
- Added nightly consolidation cron at 2:00 AM ET: `nightly-life-memory-consolidation` (isolated, silent delivery).
