import { Env, SessionRow } from '../../types';
import { requireAuth } from '../../lib/auth';
import { rowToAPI } from '../../lib/db';

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    'SELECT * FROM sessions ORDER BY created_at DESC'
  ).all<SessionRow>();

  return Response.json(results.map(rowToAPI));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const authError = requireAuth(request, env);
  if (authError) return authError;

  const body = await request.json<any>();

  const id = crypto.randomUUID();
  const slug = body.slug;
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO sessions (id, slug, title, author, role, duration, duration_sec, category, color, description, full_content, related_sessions, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    slug,
    body.title,
    body.author,
    body.role,
    body.duration,
    body.durationSec,
    body.category,
    body.color,
    body.description,
    body.fullContent || '',
    JSON.stringify(body.relatedSessions || []),
    now,
    now
  ).run();

  const row = await env.DB.prepare('SELECT * FROM sessions WHERE id = ?')
    .bind(id)
    .first<SessionRow>();

  return Response.json(rowToAPI(row!), { status: 201 });
};
