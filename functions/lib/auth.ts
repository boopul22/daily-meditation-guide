import { Env, UserRow } from '../types';
import { verifyCFAccessJWT } from './cfaccess';

export async function requireAuth(request: Request, env: Env): Promise<Response | null> {
  const jwtPayload = await verifyCFAccessJWT(request, env);
  if (!jwtPayload) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = await env.DB.prepare('SELECT is_admin FROM users WHERE email = ?')
    .bind(jwtPayload.email)
    .first<Pick<UserRow, 'is_admin'>>();

  if (!user || !user.is_admin) {
    return new Response(JSON.stringify({ error: 'Forbidden: admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return null; // Auth passed
}

export async function isAdmin(request: Request, env: Env): Promise<boolean> {
  const jwtPayload = await verifyCFAccessJWT(request, env);
  if (!jwtPayload) return false;

  const user = await env.DB.prepare('SELECT is_admin FROM users WHERE email = ?')
    .bind(jwtPayload.email)
    .first<Pick<UserRow, 'is_admin'>>();

  return !!user?.is_admin;
}
