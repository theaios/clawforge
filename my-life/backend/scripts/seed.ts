import { db } from '../src/db.js';

const now = Date.now();
const projectId = crypto.randomUUID();
const backlog = crypto.randomUUID();
const doing = crypto.randomUUID();
const review = crypto.randomUUID();
const done = crypto.randomUUID();

const projectExists = db.prepare('SELECT id FROM projects LIMIT 1').get();
if (projectExists) {
  console.log('seed skipped: data already exists');
  process.exit(0);
}

db.prepare('INSERT INTO projects (id,name,color,createdAt) VALUES (?,?,?,?)')
  .run(projectId, 'Taskmeister Spec Project', '#13a9e8', now);

const secStmt = db.prepare('INSERT INTO sections (id,projectId,name,color,icon,ord,createdAt) VALUES (?,?,?,?,?,?,?)');
secStmt.run(backlog, projectId, 'Backlog', '#27c7cf', 'inbox', 1, now);
secStmt.run(doing, projectId, 'Doing', '#13a9e8', 'pen', 2, now);
secStmt.run(review, projectId, 'Review', '#f5b000', 'search', 3, now);
secStmt.run(done, projectId, 'Done', '#45c43b', 'check', 4, now);

const tStmt = db.prepare('INSERT INTO tasks (id,projectId,sectionId,title,description,status,priority,createdAt) VALUES (?,?,?,?,?,?,?,?)');
tStmt.run(crypto.randomUUID(), projectId, backlog, 'Set up backend scaffold', 'Create TS backend + migrations + seed.', 'open', 'High', now);
tStmt.run(crypto.randomUUID(), projectId, doing, 'Wire board to API', 'Replace file-based store with API-backed data.', 'open', 'Medium', now);

console.log('seed complete');
