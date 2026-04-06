import { verifyCFAccessJWT, type CFAccessJWTPayload } from './cfaccess';

interface Env {
  CF_ACCESS_TEAM_NAME: string;
  CF_ACCESS_AUD: string;
  [key: string]: any;
}

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
