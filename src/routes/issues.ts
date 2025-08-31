import { Router } from 'express';
import { db, type Issue } from '../db';
import { z } from 'zod';

const router = Router();

// ---- GET /api/issues  (paginated + search) ----
router.get('/', (req, res) => {
  const querySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    q: z.string().trim().optional().default(''),
  });

  const { page, limit, q } = querySchema.parse(req.query);
  const offset = (page - 1) * limit;

  let where = '';
  const params: any[] = [];
  if (q) {
    where = 'WHERE title LIKE ? OR description LIKE ?';
    params.push(`%${q}%`, `%${q}%`);
  }

  const totalRow = db.prepare(`SELECT COUNT(*) as c FROM issues ${where}`).get(...params) as { c: number };
  const rows = db
    .prepare(`SELECT * FROM issues ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset) as Issue[];

  res.json({ data: rows, page, limit, total: totalRow.c });
});

// ---- POST /api/issues ----
router.post('/', (req, res) => {
  const createSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional().default(''),
    priority: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
  });

  const body = createSchema.parse(req.body);
  const stmt = db.prepare(`
    INSERT INTO issues (title, description, priority)
    VALUES (?, ?, ?)
  `);
  const info = stmt.run(body.title, body.description, body.priority);
  const issue = db.prepare(`SELECT * FROM issues WHERE id = ?`).get(info.lastInsertRowid) as Issue;
  res.status(201).json(issue);
});

// ---- GET /api/issues/:id ----
router.get('/:id', (req, res) => {
  const id = z.coerce.number().parse(req.params.id);
  const issue = db.prepare(`SELECT * FROM issues WHERE id = ?`).get(id) as Issue | undefined;
  if (!issue) return res.status(404).json({ error: 'Not found' });
  res.json(issue);
});

// ---- PATCH /api/issues/:id ----
router.patch('/:id', (req, res) => {
  const id = z.coerce.number().parse(req.params.id);
  const patchSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['open', 'in_progress', 'done']).optional(),
    priority: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  });
  const body = patchSchema.parse(req.body);

  const fields: string[] = [];
  const values: any[] = [];
  for (const [k, v] of Object.entries(body)) {
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (fields.length === 0) return res.json(db.prepare(`SELECT * FROM issues WHERE id = ?`).get(id));

  const sql = `UPDATE issues SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`;
  db.prepare(sql).run(...values, id);
  const updated = db.prepare(`SELECT * FROM issues WHERE id = ?`).get(id) as Issue;
  res.json(updated);
});

// ---- DELETE /api/issues/:id ----
router.delete('/:id', (req, res) => {
  const id = z.coerce.number().parse(req.params.id);
  db.prepare(`DELETE FROM issues WHERE id = ?`).run(id);
  res.status(204).send();
});

export default router;
