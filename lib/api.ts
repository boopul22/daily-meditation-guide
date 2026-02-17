import { Session } from '../types';

const API_BASE = '/api';

function authHeaders(): HeadersInit {
  const token = sessionStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export async function fetchSessions(): Promise<Session[]> {
  return request('/sessions');
}

export async function fetchPublicSessions(): Promise<Session[]> {
  const res = await fetch(`${API_BASE}/sessions`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchSessionBySlug(slug: string): Promise<Session> {
  return request(`/sessions/${slug}`);
}

export async function createSession(data: Partial<Session>): Promise<Session> {
  return request('/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSession(slug: string, data: Partial<Session>): Promise<Session> {
  return request(`/sessions/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSession(slug: string): Promise<void> {
  await request(`/sessions/${slug}`, { method: 'DELETE' });
}

export async function login(password: string): Promise<string> {
  const { token } = await request<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  sessionStorage.setItem('admin_token', token);
  return token;
}

export function logout(): void {
  sessionStorage.removeItem('admin_token');
}

export function isLoggedIn(): boolean {
  return !!sessionStorage.getItem('admin_token');
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || `Upload failed: ${res.status}`);
  }

  const { url } = await res.json() as { url: string };
  return url;
}
