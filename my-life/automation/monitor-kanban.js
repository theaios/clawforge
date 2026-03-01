#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'automation', 'board-tasks.json');
const WORKED_FILE = path.join(ROOT, 'automation', 'worked-tasks.json');
const LOG_FILE = path.join(ROOT, 'automation', 'monitor.log');

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const tasks = readJson(DATA_FILE, []);
const worked = new Set(readJson(WORKED_FILE, []));

const now = new Date().toISOString();
const inProgress = tasks.filter((t) => t.status === 'doing');
const newWork = inProgress.filter((t) => !worked.has(t.id));

for (const task of newWork) worked.add(task.id);
writeJson(WORKED_FILE, [...worked]);

const lines = [];
lines.push(`[${now}] in-progress=${inProgress.length}, new=${newWork.length}`);
for (const t of newWork) {
  lines.push(`  - START: ${t.title} (${t.owner || 'Unassigned'})`);
}

fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
fs.appendFileSync(LOG_FILE, lines.join('\n') + '\n');
