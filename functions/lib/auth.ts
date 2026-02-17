import { Env } from '../types';

export function requireAuth(request: Request, env: Env): Response | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.slice(7);
  if (token !== env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return null; // Auth passed
}

export function isAdmin(request: Request, env: Env): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  return authHeader.slice(7) === env.ADMIN_PASSWORD;
}
