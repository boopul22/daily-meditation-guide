import { Env, SessionRow } from '../../types';
import { requireAuth } from '../../lib/auth';
import { rowToAPI } from '../../lib/db';

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const slug = params.slug as string;

  const row = await env.DB.prepare('SELECT * FROM sessions WHERE slug = ?')
    .bind(slug)
    .first<SessionRow>();

  if (!row) {
    return Response.json({ error: 'Session not found' }, { status: 404 });
  }

  return Response.json(rowToAPI(row));
};

export const onRequestPut: PagesFunction<Env> = async ({ params, request, env }) => {
  const authError = requireAuth(request, env);
  if (authError) return authError;

  const slug = params.slug as string;
  const body = await request.json<any>();
  const now = new Date().toISOString();

  const existing = await env.DB.prepare('SELECT * FROM sessions WHERE slug = ?')
    .bind(slug)
    .first<SessionRow>();

  if (!existing) {
    return Response.json({ error: 'Session not found' }, { status: 404 });
  }

  await env.DB.prepare(
    `UPDATE sessions SET
      slug = ?, title = ?, author = ?, role = ?, duration = ?, duration_sec = ?,
      category = ?, color = ?, description = ?, featured_image = ?, audio_url = ?,
      full_content = ?, related_sessions = ?, updated_at = ?
     WHERE id = ?`
  ).bind(
    body.slug ?? existing.slug,
    body.title ?? existing.title,
    body.author ?? existing.author,
    body.role ?? existing.role,
    body.duration ?? existing.duration,
    body.durationSec ?? existing.duration_sec,
    body.category ?? existing.category,
    body.color ?? existing.color,
    body.description ?? existing.description,
    body.featuredImage ?? existing.featured_image,
    body.audioUrl ?? existing.audio_url,
    body.fullContent ?? existing.full_content,
    JSON.stringify(body.relatedSessions ?? JSON.parse(existing.related_sessions)),
    now,
    existing.id
  ).run();

  const updated = await env.DB.prepare('SELECT * FROM sessions WHERE id = ?')
    .bind(existing.id)
    .first<SessionRow>();

  return Response.json(rowToAPI(updated!));
};

export const onRequestDelete: PagesFunction<Env> = async ({ params, request, env }) => {
  const authError = requireAuth(request, env);
  if (authError) return authError;

  const slug = params.slug as string;

  const existing = await env.DB.prepare('SELECT * FROM sessions WHERE slug = ?')
    .bind(slug)
    .first<SessionRow>();

  if (!existing) {
    return Response.json({ error: 'Session not found' }, { status: 404 });
  }

  await env.DB.prepare('DELETE FROM sessions WHERE id = ?')
    .bind(existing.id)
    .run();

  return Response.json({ success: true });
};
