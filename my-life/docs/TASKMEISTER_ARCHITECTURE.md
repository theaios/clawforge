# Technical Design (Single User)

## IA Map (ASCII)
Home
├─ Projects
│  ├─ Project Board
│  ├─ Project List
│  └─ (Optional) Timeline
├─ Tasks Area (Pinboard)
├─ Notes
│  ├─ Note
│  └─ Sub-pages
├─ Reports
└─ Settings

## Stack
- Frontend: React + TypeScript (upgrade current CRA app to TS)
- Backend: Node + Fastify/Express + TypeScript
- DB: SQLite (default), Prisma/Drizzle migrations
- API: typed REST (OpenAPI / zod schemas)
- Tests: Vitest/Jest + Playwright E2E

## Core Entities
- Project(id, name, color, cover, archivedAt)
- Section(id, projectId, name, color, icon, order)
- Task(id, projectId, sectionId, title, description, dueAt, status, priority, archivedAt, deletedAt)
- Tag(id, name, color), TaskTag(taskId, tagId)
- Checklist(id, taskId), ChecklistItem(id, checklistId, text, done, order)
- Attachment(id, taskId, name, type, url, filePath)
- Comment(id, taskId, body, createdAt)
- ActivityEvent(id, taskId, type, payloadJson, createdAt)
- AutomationRule(id, projectId, sectionId, trigger, enabled)
- AutomationAction(id, ruleId, type, payloadJson, order)
- RecurringTaskTemplate(id, projectId, sectionId, rrule, templateJson)
- TasksAreaSection(id, name, color, order)
- PinnedTask(id, taskId, tasksAreaSectionId, order)
- Note(id, title, icon, cover)
- Page(id, noteId, parentPageId, title, contentJson, order)

## API Route Sketch
- /projects, /projects/:id
- /projects/:id/sections
- /tasks, /tasks/:id, /tasks/bulk
- /tasks/:id/checklist, /checklist-items/:id/toggle
- /tasks/:id/comments
- /tasks/:id/attachments
- /tasks/:id/activity
- /automations/rules, /automations/test
- /tasks-area/sections, /tasks-area/pins
- /notes, /notes/:id/pages
- /search?q=...
- /reports/completion, /reports/overdue
- /settings

## State Management
- Query cache: TanStack Query
- UI state: Zustand/Context
- Offline queue (Android + optional web): local storage/SQLite queue with retry and conflict policy (last-write-wins + activity audit)

## Docker Compose Targets
- frontend
- backend
- sqlite volume (or postgres optional)
