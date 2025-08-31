import { useEffect, useState } from 'react';
import { createIssue, listIssues, type Issue } from './lib/api';

type NewIssue = {
  title: string;
  description: string;
  priority: 1 | 2 | 3;
};

export default function App() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [form, setForm] = useState<NewIssue>({ title: '', description: '', priority: 2 });

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

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'system-ui, Arial, sans-serif' }}>
      <h1>Issue Tracker UI</h1>
      <p style={{ color: '#666' }}>
        API: <code>{import.meta.env.VITE_API_URL || 'http://localhost:3000'}</code>
      </p>

      <section style={{ margin: '1.5rem 0', padding: '1rem', border: '1px solid #eee', borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>Create Issue</h2>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            Title<br />
            <input
              required
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ width: '100%', padding: 8 }}
              placeholder="Bug title"
            />
          </label>
          <label>
            Description<br />
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ width: '100%', padding: 8, minHeight: 80 }}
              placeholder="Steps to reproduce..."
            />
          </label>
          <label>
            Priority<br />
            <select
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) as 1 | 2 | 3 }))}
              style={{ padding: 8 }}
            >
              <option value={1}>1 - High</option>
              <option value={2}>2 - Medium</option>
              <option value={3}>3 - Low</option>
            </select>
          </label>
          <button type="submit" style={{ padding: '10px 14px', fontWeight: 600 }}>Create</button>
        </form>
      </section>

      <section style={{ margin: '1.5rem 0' }}>
        <h2 style={{ marginTop: 0 }}>Issues</h2>
        {loading && <p>Loading…</p>}
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        {!loading && issues.length === 0 && <p>No issues yet.</p>}

        {issues.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {issues.map(i => (
                <tr key={i.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td>{i.id}</td>
                  <td title={i.description}>{i.title}</td>
                  <td>{i.status}</td>
                  <td>{i.priority}</td>
                  <td>{new Date(i.created_at.replace(' ', 'T') + 'Z').toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
