import type { APIContext } from 'astro';
import { requireAuth } from '../../../lib/auth';
import { rowToAuthor } from '../../../lib/db';

export async function GET(context: APIContext) {
  const db = context.locals.runtime.env.DB;
  const id = context.params.id as string;
  const row = await db.prepare('SELECT * FROM authors WHERE id = ?').bind(id).first();
  if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(rowToAuthor(row));
}

export async function PUT(context: APIContext) {
  const env = context.locals.runtime.env;
  const db = env.DB;
  const id = context.params.id as string;

  const authError = await requireAuth(context.request, env);
  if (authError) return authError;

  const body = await context.request.json() as any;
  const existing = await db.prepare('SELECT * FROM authors WHERE id = ?').bind(id).first();
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 });

  const now = new Date().toISOString();
  await db.prepare(
    `UPDATE authors SET name = ?, role = ?, picture = ?, bio = ?, updated_at = ? WHERE id = ?`
  ).bind(
    body.name ?? existing.name,
    body.role ?? existing.role,
    body.picture ?? existing.picture,
    body.bio ?? existing.bio,
    now,
    id
  ).run();

  // Denormalize into sessions so legacy author/role columns stay in sync for feeds & fallbacks
  await db.prepare(
    `UPDATE sessions SET author = ?, role = ? WHERE author_id = ?`
  ).bind(
    body.name ?? existing.name,
    body.role ?? existing.role,
    id
  ).run();

  const row = await db.prepare('SELECT * FROM authors WHERE id = ?').bind(id).first();
  return Response.json(rowToAuthor(row!));
}

export async function DELETE(context: APIContext) {
  const env = context.locals.runtime.env;
  const db = env.DB;
  const id = context.params.id as string;

  const authError = await requireAuth(context.request, env);
  if (authError) return authError;

  // Block deletion if any session still references this author
  const inUse = await db.prepare('SELECT id FROM sessions WHERE author_id = ? LIMIT 1').bind(id).first();
  if (inUse) {
    return Response.json({ error: 'Author is used by one or more sessions. Reassign those sessions first.' }, { status: 409 });
  }

  await db.prepare('DELETE FROM authors WHERE id = ?').bind(id).run();
  return Response.json({ success: true });
}
