const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type Issue = {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'done';
  priority: 1 | 2 | 3;
  created_at: string;
  updated_at: string;
};

export type Paged<T> = { data: T[]; page: number; limit: number; total: number };

export async function listIssues(page = 1, limit = 10, q = ''): Promise<Paged<Issue>> {
  const url = new URL(`${API_URL}/api/issues`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  if (q) url.searchParams.set('q', q);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  return res.json();
}

export async function createIssue(input: {
  title: string;
  description?: string;
  priority?: 1 | 2 | 3;
}): Promise<Issue> {
  const res = await fetch(`${API_URL}/api/issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (res.status === 201) return res.json();
  const text = await res.text();
  throw new Error(`Create failed: ${res.status} ${text}`);
}

export async function updateIssue(
  id: number,
  patch: Partial<Pick<Issue, 'title' | 'description' | 'status' | 'priority'>>
): Promise<Issue> {
  const res = await fetch(`${API_URL}/api/issues/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  return res.json();
}

export async function deleteIssue(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/issues/${id}`, { method: 'DELETE' });
  if (res.status === 204) return;
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}
