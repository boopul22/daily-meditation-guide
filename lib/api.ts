import { Session } from '../types';
import { convertToWebP } from './convertToWebP';

const API_BASE = '/api';

// Custom error for version conflicts
export class ConflictError extends Error {
  currentData: Session;
  constructor(message: string, currentData: Session) {
    super(message);
    this.name = 'ConflictError';
    this.currentData = currentData;
  }
}

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

    // Handle 409 Conflict specifically
    if (res.status === 409 && (body as any).conflict) {
      throw new ConflictError(
        (body as any).error || 'Conflict detected',
        (body as any).currentData
      );
    }

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
  return request(`/sessions/${encodeURIComponent(slug)}`);
}

export async function createSession(data: Partial<Session>): Promise<Session> {
  return request('/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSession(slug: string, data: Partial<Session> & { version?: number; forceSave?: boolean }): Promise<Session> {
  return request(`/sessions/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSession(slug: string): Promise<void> {
  await request(`/sessions/${encodeURIComponent(slug)}`, { method: 'DELETE' });
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
