import Database from 'better-sqlite3';
import path from 'path';

const dbPath =
  process.env.NODE_ENV === 'test'
    ? ':memory:'               // fast in-memory DB for tests
    : path.join(process.cwd(), 'data.sqlite'); // file DB for dev

export const db = new Database(dbPath);
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
