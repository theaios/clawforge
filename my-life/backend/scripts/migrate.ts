import fs from 'fs';
import path from 'path';
import { db } from '../src/db.js';

const dir = path.resolve(process.cwd(), 'migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

let appliedRaw: { applied?: string } | undefined;
try {
  appliedRaw = db.prepare('SELECT applied FROM migration_meta WHERE id=1').get() as { applied?: string } | undefined;
} catch {
  appliedRaw = undefined;
}
const applied = new Set((appliedRaw?.applied || '').split(',').filter(Boolean));

for (const file of files) {
  if (applied.has(file)) continue;
  const sql = fs.readFileSync(path.join(dir, file), 'utf8');
  db.exec(sql);
  applied.add(file);
  console.log('applied', file);
}

const appliedList = [...applied].join(',');
if (db.prepare('SELECT id FROM migration_meta WHERE id=1').get()) {
  db.prepare('UPDATE migration_meta SET applied=? WHERE id=1').run(appliedList);
} else {
  db.prepare('INSERT INTO migration_meta (id, applied) VALUES (1,?)').run(appliedList);
}

console.log('migrations complete');
