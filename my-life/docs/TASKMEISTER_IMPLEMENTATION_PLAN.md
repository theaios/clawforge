# Implementation Plan

## Milestone 0 — Foundation (current sprint)
- [ ] Lock single-user constraints in UX copy and routes
- [ ] Create backend service scaffold (TS + DB + migrations)
- [ ] Move current board data model to backend schema
- [ ] Seed/demo dataset

## Milestone 1 — Web MVP
- [ ] Projects overview + board view
- [ ] Columns CRUD/reorder/color/icon
- [ ] Task CRUD + drag/drop + due date + labels
- [ ] Checklist/attachments/comments/activity
- [ ] Soft delete/archive/restore
- [ ] Search + filters

## Milestone 2 — Web Parity
- [ ] List view + collapsible sections
- [ ] Tasks Area pinboard
- [ ] Home dashboard widgets + checklist
- [ ] Notes hierarchy and task linking
- [ ] Automations engine (create/move triggers)
- [ ] Reports
- [ ] Keyboard shortcuts + quick add + inline edit polish

## Milestone 3 — Android Build
- [ ] Choose RN client over wrapper (better native UX)
- [ ] Shared API + shared validation contracts
- [ ] Bottom sheet task detail + FAB
- [ ] Notification/reminders + share-to-app + file picker
- [ ] Offline queue + sync

## Milestone 4 — Quality + Ops
- [ ] Unit + E2E smoke tests
- [ ] Docker Compose one-command run
- [ ] Definition of Done validation

## Definition of Done (DoD)
- [ ] All required flows pass smoke tests
- [ ] Single-user constraints verified
- [ ] Migrations + seeds reproducible
- [ ] Core APIs documented and typed
- [ ] Android install + offline/sync tested
