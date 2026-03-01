# Taskmeister-Style Single-User Kanban — PRD

## Product Goal
Build a production-ready **single-user** task management system with Taskmeister-like UX:
1. Web app first (responsive)
2. Android app second (shared backend/domain)

## Constraints
- Single user only (no invites/teams/collab)
- Original implementation/assets only
- Local-first capable (Docker Compose)

## Screens
1. Home Dashboard
2. Projects Overview
3. Project Board View
4. Project List View
5. Tasks Area (Pinboard)
6. Task Detail Modal/Drawer
7. Notes Dashboard + Note Editor
8. Reports
9. Settings

## Feature Checklist
### Web MVP
- [ ] Projects CRUD + search
- [ ] Board view with drag/drop columns/cards
- [ ] Column rename/reorder/delete + color/icon
- [ ] Task CRUD + due date + labels + checklist + URL/file attachments
- [ ] Comments + activity log
- [ ] Soft delete/archive/restore
- [ ] Global/project search + filters
- [ ] Settings: theme, fade old tasks

### Web Feature Parity
- [ ] List view sections (collapsible)
- [ ] Tasks Area pinboard sections + drag/unpin
- [ ] Home checklist (disappears when checked; convert to task)
- [ ] Notes with pages/subpages + task linking
- [ ] Automations (on create/on move)
- [ ] Reports (completion/overdue)
- [ ] Keyboard shortcuts + quick add + inline edits

### Android
- [ ] Native APK with icon/splash
- [ ] Shared backend API
- [ ] Offline cache + queued edits/sync
- [ ] Notifications + file picker + share-to-app
- [ ] Bottom-sheet task detail + FAB quick add + gestures

## Non-Goals
- Multi-user access, sharing, permissions, live collaboration
