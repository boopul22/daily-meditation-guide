import type { APIContext } from 'astro';
import { verifyCFAccessJWT } from '../../../lib/cfaccess';

interface UserRow {
  id: string;
  email: string;
  name: string;
  picture: string;
  is_admin: number;
  created_at: string;
  last_login: string;
}

export async function GET(context: APIContext) {
  const env = context.locals.runtime.env;
  const db = env.DB;

  const jwtPayload = await verifyCFAccessJWT(context.request, env);
  if (!jwtPayload) {
    return Response.json({ user: null });
  }

  const email = jwtPayload.email;
  const name = jwtPayload.name || email.split('@')[0];
  const now = new Date().toISOString();

  let user = await db.prepare('SELECT * FROM users WHERE email = ?')
    .bind(email)
    .first<UserRow>();

  if (!user) {
    const id = crypto.randomUUID();
    await db.prepare(
      'INSERT INTO users (id, email, name, picture, is_admin, created_at, last_login) VALUES (?, ?, ?, ?, 0, ?, ?)'
    )
      .bind(id, email, name, '', now, now)
      .run();

    user = { id, email, name, picture: '', is_admin: 0, created_at: now, last_login: now };
  } else {
    await db.prepare('UPDATE users SET last_login = ?, name = ? WHERE email = ?')
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
      isAdmin: !!user.is_admin,
    },
  });
}
