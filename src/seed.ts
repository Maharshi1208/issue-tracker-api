// src/seed.ts
import { db } from './db';

const titles = [
  'Login page error',
  'Payment gateway timeout',
  'Profile image upload fails',
  'Search returns duplicates',
  'CSV export misaligned',
  'Dark mode contrast',
  'Session expired early',
  'Webhook signature invalid',
  'Mobile layout overflow',
  'Rate limiter too strict',
];

const descriptions = [
  'Steps: open page, click button, observe error.',
  'Happens under moderate load; retry succeeds.',
  'Possibly related to file size or type filter.',
  'Happens with certain keywords only.',
  'Observed on Firefox; Chrome OK.',
  'Customer reported in support ticket.',
  'Non-deterministic; appears once per 20 tries.',
];

const statuses: Array<'open' | 'in_progress' | 'done'> = ['open', 'in_progress', 'done'];

function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

function seed(count = 150) {
  const row = db.prepare(`
    INSERT INTO issues (title, description, status, priority, created_at, updated_at)
    VALUES (@title, @description, @status, @priority, @created_at, @updated_at)
  `);

  const exists = db.prepare(`SELECT COUNT(*) as c FROM issues`).get() as { c: number };
  if (exists.c > 0) {
    console.log(`DB already has ${exists.c} issues — skipping seed.`);
    return;
  }

  const now = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const toSqlTime = (d: Date) =>
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;

  const insertMany = db.transaction((n: number) => {
    for (let i = 1; i <= n; i++) {
      const created = new Date(now.getTime() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)); // last 14 days
      row.run({
        title: `${pick(titles)} #${i}`,
        description: pick(descriptions),
        status: pick(statuses),
        priority: (1 + (i % 3)) as 1 | 2 | 3,
        created_at: toSqlTime(created),
        updated_at: toSqlTime(created),
      });
    }
  });

  insertMany(count);
  console.log(`Seeded ${count} issues.`);
}

seed();
