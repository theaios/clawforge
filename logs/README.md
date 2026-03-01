# Change Logs

This folder tracks configuration and implementation changes made by the agent.

## Files
- `config-changes/CONFIG_CHANGELOG.md` — append-only high-level config changes
- `change-runs/YYYY-MM-DD.log` — timestamped operational run logs for each change batch

## Logging rules
- Log what changed, why, files touched, commands run, and verification result.
- Never log secrets (tokens, passwords, private keys, confidential contents).
- Redact sensitive values as `[REDACTED]`.
