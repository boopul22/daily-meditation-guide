import type { Session, Infographic, Author } from '../types';

const API_BASE = '/api';

// Custom error for version conflicts
export class ConflictError extends Error {
  currentData: Session | Infographic;
  constructor(message: string, currentData: Session | Infographic) {
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

export async function fetchInfographics(): Promise<Infographic[]> {
  return request('/infographics');
}

export async function fetchInfographicBySlug(slug: string): Promise<Infographic> {
  return request(`/infographics/${encodeURIComponent(slug)}`);
}

export async function createInfographic(data: Partial<Infographic>): Promise<Infographic> {
  return request('/infographics', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateInfographic(
  slug: string,
  data: Partial<Infographic> & { version?: number; forceSave?: boolean },
): Promise<Infographic> {
  return request(`/infographics/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteInfographic(slug: string): Promise<void> {
  await request(`/infographics/${encodeURIComponent(slug)}`, { method: 'DELETE' });
}

export async function fetchAuthors(): Promise<Author[]> {
  return request('/authors');
}

export async function createAuthor(data: Partial<Author>): Promise<Author> {
  return request('/authors', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateAuthor(id: string, data: Partial<Author>): Promise<Author> {
  return request(`/authors/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

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
