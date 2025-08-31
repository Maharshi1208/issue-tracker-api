import { Router } from 'express';
import { z } from 'zod';
import { db, Issue } from '../db';

const router = Router();

const CreateIssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional().default(2)
});

const UpdateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'done']).optional(),
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional()
});

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM issues ORDER BY created_at DESC').all() as Issue[];
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM issues WHERE id = ?').get(id) as Issue | undefined;
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const parsed = CreateIssueSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { title, description, priority } = parsed.data;
  const info = db
    .prepare('INSERT INTO issues (title, description, priority) VALUES (?, ?, ?)')
    .run(title, description, priority);

  const created = db.prepare('SELECT * FROM issues WHERE id = ?').get(info.lastInsertRowid) as Issue;
  res.status(201).json(created);
});

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const parsed = UpdateIssueSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = db.prepare('SELECT * FROM issues WHERE id = ?').get(id) as Issue | undefined;
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const merged = { ...existing, ...parsed.data };
  db.prepare(`
    UPDATE issues
    SET title = ?, description = ?, status = ?, priority = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(merged.title, merged.description, merged.status, merged.priority, id);

  const updated = db.prepare('SELECT * FROM issues WHERE id = ?').get(id) as Issue;
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('DELETE FROM issues WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

export default router;
