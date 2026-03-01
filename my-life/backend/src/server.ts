import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { db } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const taskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  sectionId: z.string(),
  title: z.string(),
  description: z.string().optional().default(''),
  status: z.enum(['open', 'completed']).default('open'),
  dueAt: z.string().nullable().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium')
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/api/projects', (_req, res) => {
  const rows = db.prepare('SELECT * FROM projects WHERE archivedAt IS NULL ORDER BY createdAt DESC').all();
  res.json(rows);
});

app.post('/api/projects', (req, res) => {
  const id = crypto.randomUUID();
  const name = String(req.body?.name || '').trim();
  if (!name) return res.status(400).json({ error: 'name required' });
  db.prepare('INSERT INTO projects (id,name,color,createdAt) VALUES (?,?,?,?)').run(id, name, '#13a9e8', Date.now());
  res.json({ id, name });
});

app.get('/api/tasks', (req, res) => {
  const projectId = String(req.query.projectId || '');
  const rows = projectId
    ? db.prepare('SELECT * FROM tasks WHERE projectId = ? AND deletedAt IS NULL ORDER BY createdAt DESC').all(projectId)
    : db.prepare('SELECT * FROM tasks WHERE deletedAt IS NULL ORDER BY createdAt DESC').all();
  res.json(rows);
});

app.post('/api/tasks', (req, res) => {
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const t = parsed.data;
  db.prepare(`INSERT INTO tasks (id,projectId,sectionId,title,description,status,dueAt,priority,createdAt)
              VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(t.id, t.projectId, t.sectionId, t.title, t.description, t.status, t.dueAt || null, t.priority, Date.now());
  res.json({ ok: true, id: t.id });
});

const port = Number(process.env.API_PORT || 8787);
app.listen(port, () => {
  console.log(`my-life backend listening on :${port}`);
});
