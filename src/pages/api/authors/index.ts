import type { APIContext } from 'astro';
import { requireAuth } from '../../../lib/auth';
import { rowToAuthor } from '../../../lib/db';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET(context: APIContext) {
  const db = context.locals.runtime.env.DB;
  const { results } = await db.prepare('SELECT * FROM authors ORDER BY name ASC').all();
  return Response.json((results || []).map(rowToAuthor));
}

export async function POST(context: APIContext) {
  const env = context.locals.runtime.env;
  const db = env.DB;

  const authError = await requireAuth(context.request, env);
  if (authError) return authError;

  const body = await context.request.json() as any;
  const name = (body.name || '').trim();
  if (!name) return Response.json({ error: 'Name is required' }, { status: 400 });

  const baseSlug = slugify(body.slug || name);
  if (!baseSlug) return Response.json({ error: 'Slug is required' }, { status: 400 });

  // Ensure unique slug
  let slug = baseSlug;
  let n = 1;
  while (await db.prepare('SELECT id FROM authors WHERE slug = ?').bind(slug).first()) {
    n += 1;
    slug = `${baseSlug}-${n}`;
  }

  const id = `auth_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const now = new Date().toISOString();

  await db.prepare(
    `INSERT INTO authors (id, slug, name, role, picture, bio, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    slug,
    name,
    body.role || '',
    body.picture || '',
    body.bio || '',
    now,
    now
  ).run();

  const row = await db.prepare('SELECT * FROM authors WHERE id = ?').bind(id).first();
  return Response.json(rowToAuthor(row!), { status: 201 });
}
