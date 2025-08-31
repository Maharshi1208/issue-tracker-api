import { useEffect, useMemo, useState } from 'react';
import { createIssue, listIssues, updateIssue, deleteIssue, type Issue } from './lib/api';

type NewIssue = {
  title: string;
  description: string;
  priority: 1 | 2 | 3;
};

const statusColors: Record<Issue['status'], string> = {
  open: '#0ea5e9',          // blue
  in_progress: '#f59e0b',   // amber
  done: '#22c55e',          // green
};

function Badge({ s }: { s: Issue['status'] }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        background: statusColors[s],
        color: '#fff',
        fontSize: 12,
        textTransform: 'capitalize',
      }}
    >
      {s.replace('_', ' ')}
    </span>
  );
}

function fmt(ts: string) {
  // created_at is "YYYY-MM-DD HH:MM:SS" (UTC from SQLite)
  return new Date(ts.replace(' ', 'T') + 'Z').toLocaleString();
}

export default function App() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [form, setForm] = useState<NewIssue>({ title: '', description: '', priority: 2 });
  const [query, setQuery] = useState('');

  async function refresh() {
    try {
      setLoading(true);
      setError('');
      const data = await listIssues();
      setIssues(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError('');
      await createIssue(form);
      setForm({ title: '', description: '', priority: 2 });
      await refresh();
    } catch (e: any) {
      setError(e.message || 'Failed to create issue');
    }
  }

  async function setStatus(id: number, status: Issue['status']) {
    try {
      setError('');
      await updateIssue(id, { status });
      await refresh();
    } catch (e: any) {
      setError(e.message || 'Update failed');
    }
  }

  async function remove(id: number) {
    try {
      setError('');
      await deleteIssue(id);
      await refresh();
    } catch (e: any) {
      setError(e.message || 'Delete failed');
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...issues].sort((a, b) => b.created_at.localeCompare(a.created_at));
    if (!q) return sorted;
    return sorted.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q) ||
        String(i.id) === q
    );
  }, [issues, query]);

  return (
    <div style={{ maxWidth: 1100, margin: '2rem auto', fontFamily: 'system-ui, Arial, sans-serif', color: '#e5e7eb' }}>
      <h1 style={{ color: '#fff' }}>Issue Tracker UI</h1>
      <p style={{ color: '#9ca3af' }}>
        API: <code>{import.meta.env.VITE_API_URL || 'http://localhost:3000'}</code>
      </p>

      <section style={{ margin: '1.5rem 0', padding: '1rem', border: '1px solid #374151', borderRadius: 8, background: '#111827' }}>
        <h2 style={{ marginTop: 0, color: '#fff' }}>Create Issue</h2>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            Title<br />
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              style={{ width: '100%', padding: 8, background: '#111827', color: '#e5e7eb', border: '1px solid #374151' }}
              placeholder="Bug title"
            />
          </label>
          <label>
            Description<br />
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              style={{ width: '100%', padding: 8, minHeight: 80, background: '#111827', color: '#e5e7eb', border: '1px solid #374151' }}
              placeholder="Steps to reproduce..."
            />
          </label>
          <label>
            Priority<br />
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) as 1 | 2 | 3 }))}
              style={{ padding: 8, background: '#111827', color: '#e5e7eb', border: '1px solid #374151' }}
            >
              <option value={1}>1 - High</option>
              <option value={2}>2 - Medium</option>
              <option value={3}>3 - Low</option>
            </select>
          </label>
          <button type="submit" style={{ padding: '10px 14px', fontWeight: 600, background: '#2563eb', color: '#fff', border: 0, borderRadius: 6 }}>
            Create
          </button>
        </form>
      </section>

      <section style={{ margin: '1.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0, color: '#fff' }}>Issues</h2>
          <input
            placeholder="Search title/description/id…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: 8, minWidth: 280, background: '#111827', color: '#e5e7eb', border: '1px solid #374151', borderRadius: 6 }}
          />
        </div>
        {loading && <p>Loading…</p>}
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        {!loading && filtered.length === 0 && <p>No issues found.</p>}

        {filtered.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #374151' }}>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th style={{ width: 320 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td>{i.id}</td>
                  <td title={i.description}>{i.title}</td>
                  <td><Badge s={i.status} /></td>
                  <td>{i.priority}</td>
                  <td>{fmt(i.created_at)}</td>
                  <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '8px 0' }}>
                    {i.status !== 'in_progress' && (
                      <button onClick={() => setStatus(i.id, 'in_progress')} style={btn('#f59e0b')}>Start</button>
                    )}
                    {i.status !== 'done' && (
                      <button onClick={() => setStatus(i.id, 'done')} style={btn('#22c55e')}>Done</button>
                    )}
                    {i.status !== 'open' && (
                      <button onClick={() => setStatus(i.id, 'open')} style={btn('#0ea5e9')}>Reopen</button>
                    )}
                    <button onClick={() => remove(i.id)} style={btn('#ef4444')}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function btn(bg: string): React.CSSProperties {
  return {
    padding: '6px 10px',
    background: bg,
    color: '#0b0f16',
    border: 0,
    borderRadius: 6,
    fontWeight: 700,
    cursor: 'pointer',
  };
}
