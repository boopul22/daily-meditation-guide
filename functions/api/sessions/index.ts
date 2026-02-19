import { Env, SessionRow } from '../../types';
import { requireAuth, isAdmin } from '../../lib/auth';
import { verifyCFAccessJWT } from '../../lib/cfaccess';
import { rowToAPI } from '../../lib/db';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const admin = await isAdmin(request, env);

  let query: string;
  if (admin) {
    // Admin sees all sessions
    query = 'SELECT * FROM sessions ORDER BY created_at DESC';
  } else {
    // Public sees only published
    query = "SELECT * FROM sessions WHERE status = 'published' ORDER BY published_at DESC";
  }

  const { results } = await env.DB.prepare(query).all<SessionRow>();
  return Response.json(results.map(rowToAPI));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const authError = await requireAuth(request, env);
  if (authError) return authError;

  const body = await request.json<any>();

  // Get current user email for audit
  const jwtPayload = await verifyCFAccessJWT(request, env);
  const creatorEmail = jwtPayload?.email || null;

  const id = crypto.randomUUID();
  const slug = body.slug;
  const now = new Date().toISOString();
  const status = body.status === 'published' ? 'published' : 'draft';
  const publishedAt = status === 'published' ? now : null;

  await env.DB.prepare(
    `INSERT INTO sessions (id, slug, title, author, role, duration, duration_sec, category, color, description, featured_image, audio_url, full_content, related_sessions, faq_items, status, published_at, created_at, updated_at, version, last_updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    slug,
    body.title,
    body.author,
    body.role,
    body.duration || '',
    body.durationSec || 0,
    body.category,
    body.color,
    body.description,
    body.featuredImage || '',
    body.audioUrl || '',
    body.fullContent || '',
    JSON.stringify(body.relatedSessions || []),
    JSON.stringify(body.faqItems || []),
    status,
    publishedAt,
    now,
    now,
    1,
    creatorEmail
  ).run();

  const row = await env.DB.prepare('SELECT * FROM sessions WHERE id = ?')
    .bind(id)
    .first<SessionRow>();

  return Response.json(rowToAPI(row!), { status: 201 });
};
