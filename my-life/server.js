const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

const WEB_PORT = Number(process.env.PORT || 3001);
const BUILD_DIR = path.join(__dirname, 'build');

const DATA_DIR = path.join(__dirname, 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const WORKED_FILE = path.join(DATA_DIR, 'worked-task-ids.json');

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
const defaultTasks = [];

function ensureData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(TASKS_FILE)) fs.writeFileSync(TASKS_FILE, JSON.stringify(defaultTasks, null, 2));
  if (!fs.existsSync(WORKED_FILE)) fs.writeFileSync(WORKED_FILE, JSON.stringify([], null, 2));
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function readTasks() {
  ensureData();
  return readJson(TASKS_FILE, defaultTasks);
}

function writeTasks(tasks) {
  ensureData();
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

function readWorkedIds() {
  ensureData();
  return new Set(readJson(WORKED_FILE, []));
}

function writeWorkedIds(set) {
  ensureData();
  fs.writeFileSync(WORKED_FILE, JSON.stringify([...set], null, 2));
}

function isAssignedToAI(task) {
  return (task.owner || '').toLowerCase() === 'theaios';
}

function notify(text) {
  const safe = String(text).replace(/"/g, '\\"');
  exec(`openclaw system event --text "${safe}" --mode now`, () => {});
}

function normalizeTask(task) {
  return {
    ...task,
    updates: Array.isArray(task.updates) ? task.updates : [],
    nextMilestone: (task.nextMilestone || '').trim(),
    sensitiveAction: Boolean(task.sensitiveAction),
    executionPlan: (task.executionPlan || '').trim(),
  };
}

function validateTasks(prevTasks, nextTasks) {
  const errors = [];

  for (const raw of nextTasks) {
    const t = normalizeTask(raw);
    const prev = prevTasks.find((p) => p.id === t.id);
    const movedToDoing = (!prev || prev.status !== 'doing') && t.status === 'doing';

    if (t.status === 'doing') {
      if (!t.owner || t.owner === 'Both') {
        errors.push(`Task "${t.title}" must have a single owner before In Progress.`);
      }
      if (!t.nextMilestone) {
        errors.push(`Task "${t.title}" must include a next milestone before In Progress.`);
      }
      if (t.sensitiveAction && !t.executionPlan) {
        errors.push(`Task "${t.title}" is sensitive and requires plan-before-execute notes.`);
      }
    }

    if (movedToDoing && (prev?.status === 'backlog' || prev?.status === 'todo' || !prev)) {
      // Allowed transition, but execution should only start here (handled by startedAt below)
    }
  }

  return errors;
}

function processTaskTransitions(prevTasks, nextTasks) {
  const workedIds = readWorkedIds();
  const now = Date.now();

  const processed = nextTasks.map((raw) => {
    const next = normalizeTask(raw);
    const prev = prevTasks.find((t) => t.id === next.id);
    const prevUpdates = Array.isArray(prev?.updates) ? prev.updates : [];

    const becameDoing = (!prev || prev.status !== 'doing') && next.status === 'doing';
    const unworked = !workedIds.has(next.id);
    const mine = isAssignedToAI(next);

    if (becameDoing) {
      next.startedAt = now;
      if (mine) next.nextUpdateDueAt = now + FOUR_HOURS_MS;
    }

    if (becameDoing && mine && unworked) {
      workedIds.add(next.id);
      notify(`New assigned Kanban task started: ${next.title}`);
    }

    const hasNewUpdate = next.updates.length > prevUpdates.length;
    if (hasNewUpdate && next.status === 'doing' && mine) {
      next.nextUpdateDueAt = now + FOUR_HOURS_MS;
      next.lastStatusUpdateAt = now;

      const latest = next.updates[0] || {};
      const latestText = String(latest.text || '').toLowerCase();
      const latestAuthor = String(latest.author || '').toLowerCase();
      const readyForReview = latestAuthor === 'theaios' && (
        latestText.includes('ready for review') ||
        latestText.includes('#ready_for_review')
      );

      if (readyForReview) {
        next.status = 'review';
        notify(`Task moved to Review: ${next.title}`);
      }
    }

    return next;
  });

  writeWorkedIds(workedIds);
  return processed;
}

function sendDueStatusReminders() {
  const now = Date.now();
  const tasks = readTasks();
  let changed = false;

  const next = tasks.map((t) => {
    const task = normalizeTask(t);
    const due = task.nextUpdateDueAt || 0;
    const isDue = due > 0 && due <= now;
    const mine = isAssignedToAI(task);
    const active = task.status === 'doing';

    if (mine && active && isDue) {
      const remindGap = 60 * 60 * 1000;
      const lastReminderAt = task.lastReminderAt || 0;
      if (now - lastReminderAt >= remindGap) {
        notify(`Status update due for task: ${task.title}. Please post a board update.`);
        task.lastReminderAt = now;
        changed = true;
      }
    }

    return task;
  });

  if (changed) writeTasks(next);
}

app.get('/api/tasks', (_req, res) => {
  res.json(readTasks().map(normalizeTask));
});

app.put('/api/tasks', (req, res) => {
  const incoming = Array.isArray(req.body) ? req.body : [];
  const prevTasks = readTasks();

  const errors = validateTasks(prevTasks, incoming);
  if (errors.length) return res.status(400).json({ ok: false, errors });

  const processed = processTaskTransitions(prevTasks, incoming);
  writeTasks(processed);
  return res.json({ ok: true });
});

app.use(express.static(BUILD_DIR));
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  return res.sendFile(path.join(BUILD_DIR, 'index.html'));
});

app.listen(WEB_PORT, () => {
  ensureData();
  // Legacy due-status reminder automation disabled by user request.
  console.log(`Kanban app + API running on http://localhost:${WEB_PORT}`);
});
