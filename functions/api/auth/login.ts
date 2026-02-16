import { Env } from '../../types';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json<{ password: string }>();

  if (body.password === env.ADMIN_PASSWORD) {
    return Response.json({ token: env.ADMIN_PASSWORD });
  }

  return Response.json({ error: 'Invalid password' }, { status: 401 });
};
