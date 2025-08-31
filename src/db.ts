import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const isTest = process.env.NODE_ENV === 'test';

// Default path: ./data/data.sqlite (for dev & prod)
const defaultPath = path.join(process.cwd(), 'data', 'data.sqlite');

// Use :memory: for tests, otherwise allow override with DB_PATH
const dbFilePath = isTest ? ':memory:' : (process.env.DB_PATH || defaultPath);

// Ensure folder exists if using file DB
if (!isTest && dbFilePath !== ':memory:') {
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export const db = new Database(dbFilePath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open',   -- open | in_progress | done
    priority INTEGER NOT NULL DEFAULT 2,   -- 1=high, 2=medium, 3=low
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export type Issue = {
  id: number;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'done';
  priority: 1 | 2 | 3;
  created_at: string;
  updated_at: string;
};
