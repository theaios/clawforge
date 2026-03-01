# CONFIG_CHANGELOG

Append-only record of config/behavior changes.

## 2026-02-27
- Initialized persistent change logging system under `logs/`.
- Created `logs/README.md`, `logs/config-changes/CONFIG_CHANGELOG.md`, and `logs/change-runs/`.
- Policy: all future configuration or behavior changes must be logged with timestamp, reason, files, commands, verification.
