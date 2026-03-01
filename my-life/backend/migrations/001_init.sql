CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  cover TEXT,
  archivedAt INTEGER,
  createdAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  ord INTEGER DEFAULT 0,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY(projectId) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  sectionId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  dueAt TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'Medium',
  archivedAt INTEGER,
  deletedAt INTEGER,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY(projectId) REFERENCES projects(id),
  FOREIGN KEY(sectionId) REFERENCES sections(id)
);

CREATE TABLE IF NOT EXISTS migration_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  applied TEXT NOT NULL
);
