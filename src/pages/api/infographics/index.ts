import type { APIContext } from 'astro';
import { requireAuth, isAdmin } from '../../../lib/auth';
import { verifyCFAccessJWT } from '../../../lib/cfaccess';
import { rowToInfographic } from '../../../lib/db';

export async function GET(context: APIContext) {
  const env = context.locals.runtime.env;
  const db = env.DB;
  const admin = await isAdmin(context.request, env);

  const query = admin
    ? 'SELECT * FROM infographics ORDER BY created_at DESC'
    : "SELECT * FROM infographics WHERE status = 'published' ORDER BY published_at DESC";

  const { results } = await db.prepare(query).all();
  return Response.json(results.map(rowToInfographic));
}

export async function POST(context: APIContext) {
  const env = context.locals.runtime.env;
  const db = env.DB;

  const authError = await requireAuth(context.request, env);
  if (authError) return authError;

  const body = await context.request.json() as any;

  const jwtPayload = await verifyCFAccessJWT(context.request, env);
  const creatorEmail = jwtPayload?.email || null;

  const id = crypto.randomUUID();
  const slug = (body.slug || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  if (!slug) {
    return Response.json({ error: 'Slug is required' }, { status: 400 });
  }
  if (!body.title) {
    return Response.json({ error: 'Title is required' }, { status: 400 });
  }
  if (!body.imageUrl) {
    return Response.json({ error: 'Image is required' }, { status: 400 });
  }

  const existingBySlug = await db.prepare('SELECT id FROM infographics WHERE slug = ?')
    .bind(slug)
    .first();
  if (existingBySlug) {
    return Response.json({ error: `An infographic with slug "${slug}" already exists` }, { status: 409 });
  }

  const now = new Date().toISOString();
  const status = body.status === 'published' ? 'published' : 'draft';
  const publishedAt = status === 'published' ? now : null;

  await db.prepare(
    `INSERT INTO infographics (id, slug, title, description, image_url, image_width, image_height, alt_text, tags, seo_title, seo_description, status, published_at, created_at, updated_at, version, last_updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    slug,
    body.title,
    body.description || '',
    body.imageUrl,
    body.imageWidth || 0,
    body.imageHeight || 0,
    body.altText || body.title,
    JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
    body.seoTitle || '',
    body.seoDescription || '',
    status,
    publishedAt,
    now,
    now,
    1,
    creatorEmail,
  ).run();

  const row = await db.prepare('SELECT * FROM infographics WHERE id = ?').bind(id).first();
  return Response.json(rowToInfographic(row!), { status: 201 });
}
