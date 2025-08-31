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

export async function listIssues(): Promise<Issue[]> {
  const res = await fetch(`${API_URL}/api/issues`);
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
