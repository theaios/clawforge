# My Life Backend (Milestone 0 Scaffold)

## Quick start
```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

API runs on `http://localhost:8787`.

## Current endpoints
- `GET /health`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/tasks?projectId=...`
- `POST /api/tasks`

## Data
SQLite DB at `backend/data/app.db`.
Migrations are SQL files in `backend/migrations`.
