import { Env } from '../types';
import { verifyCFAccessJWT, CFAccessJWTPayload } from './cfaccess';

export async function requireUser(
  request: Request,
  env: Env
): Promise<{ error: Response } | { payload: CFAccessJWTPayload }> {
  const payload = await verifyCFAccessJWT(request, env);
  if (!payload) {
    return {
      error: new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }
  return { payload };
}
