import type { APIContext } from 'astro';
import { requireAuth, isAdmin } from '../../../lib/auth';
import { verifyCFAccessJWT } from '../../../lib/cfaccess';
import { rowToSession, SESSION_SELECT_WITH_AUTHOR } from '../../../lib/db';

export async function GET(context: APIContext) {
  const env = context.locals.runtime.env;
  const db = env.DB;
  const admin = await isAdmin(context.request, env);

  const query = admin
    ? `${SESSION_SELECT_WITH_AUTHOR} ORDER BY s.created_at DESC`
    : `${SESSION_SELECT_WITH_AUTHOR} WHERE s.status = 'published' ORDER BY s.published_at DESC`;

  const { results } = await db.prepare(query).all();
  return Response.json(results.map(rowToSession));
}

export async function POST(context: APIContext) {
  const env = context.locals.runtime.env;
  const db = env.DB;

  const authError = await requireAuth(context.request, env);
  if (authError) return authError;

  const body = await context.request.json() as any;

  // Get current user email for audit
  const jwtPayload = await verifyCFAccessJWT(context.request, env);
  const creatorEmail = jwtPayload?.email || null;

  const id = crypto.randomUUID();
  // Sanitize slug: lowercase, replace non-alphanumeric with hyphens, collapse multiples, trim
  const slug = (body.slug || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (!slug) {
    return Response.json({ error: 'Slug is required' }, { status: 400 });
  }

  // Check for duplicate slug
  const existingBySlug = await db.prepare('SELECT id FROM sessions WHERE slug = ?')
    .bind(slug)
    .first();
  if (existingBySlug) {
    return Response.json({ error: `A session with slug "${slug}" already exists` }, { status: 409 });
  }

  const now = new Date().toISOString();
  const status = body.status === 'published' ? 'published' : 'draft';
  const publishedAt = status === 'published' ? now : null;

  // Resolve author_id → denormalized author/role for feeds + legacy fallback
  let authorId: string | null = body.authorId || null;
  let authorName = body.author || '';
  let authorRole = body.role || '';
  if (authorId) {
    const authorRow = await db.prepare('SELECT name, role FROM authors WHERE id = ?').bind(authorId).first();
    if (!authorRow) return Response.json({ error: 'Author not found' }, { status: 400 });
    authorName = authorRow.name as string;
    authorRole = authorRow.role as string;
  }

  await db.prepare(
    `INSERT INTO sessions (id, slug, title, author, role, author_id, duration, duration_sec, category, color, description, featured_image, audio_url, full_content, related_sessions, faq_items, status, published_at, created_at, updated_at, version, last_updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    slug,
    body.title,
    authorName,
    authorRole,
    authorId,
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

  const row = await db.prepare(`${SESSION_SELECT_WITH_AUTHOR} WHERE s.id = ?`)
    .bind(id)
    .first();

  return Response.json(rowToSession(row!), { status: 201 });
}
