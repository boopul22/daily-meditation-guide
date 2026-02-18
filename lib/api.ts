import { Session } from '../types';
import { convertToWebP } from './convertToWebP';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
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

export async function uploadImage(file: File): Promise<string> {
  // Convert JPEG/PNG to WebP client-side before uploading
  const processedFile = await convertToWebP(file);

  const formData = new FormData();
  formData.append('file', processedFile);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || `Upload failed: ${res.status}`);
  }

  const { url } = await res.json() as { url: string };
  return url;
}
