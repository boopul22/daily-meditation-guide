import { Env, UserRow } from '../../types';
import { verifyCFAccessJWT } from '../../lib/cfaccess';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const jwtPayload = await verifyCFAccessJWT(request, env);

  if (!jwtPayload) {
    return Response.json({ user: null });
  }

  const email = jwtPayload.email;
  const name = jwtPayload.name || email.split('@')[0];
  const now = new Date().toISOString();

  let user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
    .bind(email)
    .first<UserRow>();

  if (!user) {
    const id = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO users (id, email, name, picture, created_at, last_login) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(id, email, name, '', now, now)
      .run();

    user = { id, email, name, picture: '', created_at: now, last_login: now };
  } else {
    await env.DB.prepare('UPDATE users SET last_login = ?, name = ? WHERE email = ?')
      .bind(now, name, email)
      .run();
    user = { ...user, last_login: now, name };
  }

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
  });
};
