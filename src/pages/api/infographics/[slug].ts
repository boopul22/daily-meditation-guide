import type { APIContext } from 'astro';
import { requireAuth, isAdmin } from '../../../lib/auth';
import { verifyCFAccessJWT } from '../../../lib/cfaccess';
import { rowToInfographic } from '../../../lib/db';

export async function GET(context: APIContext) {
  const env = context.locals.runtime.env;
  const db = env.DB;
  const slug = context.params.slug as string;

  const row = await db.prepare('SELECT * FROM infographics WHERE slug = ?').bind(slug).first();

  if (!row) {
    return Response.json({ error: 'Infographic not found' }, { status: 404 });
  }

  if (row.status !== 'published' && !(await isAdmin(context.request, env))) {
    return Response.json({ error: 'Infographic not found' }, { status: 404 });
  }

  return Response.json(rowToInfographic(row));
}

export async function PUT(context: APIContext) {
  const env = context.locals.runtime.env;
  const db = env.DB;
  const slug = context.params.slug as string;

  const authError = await requireAuth(context.request, env);
  if (authError) return authError;

  try {
    const body = await context.request.json() as any;
    const now = new Date().toISOString();

    const existing = await db.prepare('SELECT * FROM infographics WHERE slug = ?')
      .bind(slug)
      .first();

    if (!existing) {
      return Response.json({ error: 'Infographic not found' }, { status: 404 });
    }

    const incomingVersion = body.version;
    if (incomingVersion !== undefined && incomingVersion !== null && !body.forceSave) {
      if (existing.version !== incomingVersion) {
        return Response.json({
          error: 'Conflict: this infographic was modified by another admin',
          conflict: true,
          currentData: rowToInfographic(existing),
        }, { status: 409 });
      }
    }

    const jwtPayload = await verifyCFAccessJWT(context.request, env);
    const updaterEmail = jwtPayload?.email || null;

    let newSlug = existing.slug as string;
    if (body.slug !== undefined && body.slug !== null) {
      newSlug = (body.slug || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!newSlug) {
        return Response.json({ error: 'Slug is required' }, { status: 400 });
      }
      if (newSlug !== existing.slug) {
        const conflicting = await db.prepare('SELECT id FROM infographics WHERE slug = ? AND id != ?')
          .bind(newSlug, existing.id)
          .first();
        if (conflicting) {
          return Response.json({ error: `An infographic with slug "${newSlug}" already exists` }, { status: 409 });
        }
      }
    }

    const newStatus = body.status ?? existing.status ?? 'draft';
    let publishedAt = existing.published_at as string | null;
    if (newStatus === 'published' && existing.status !== 'published') {
      publishedAt = now;
    }
    if (newStatus === 'draft') {
      publishedAt = null;
    }

    let existingTags: string[] = [];
    try {
      existingTags = existing.tags ? JSON.parse(existing.tags as string) : [];
    } catch {
      existingTags = [];
    }

    const newVersion = ((existing.version as number) ?? 1) + 1;

    await db.prepare(
      `UPDATE infographics SET
        slug = ?, title = ?, description = ?, image_url = ?, image_width = ?, image_height = ?,
        alt_text = ?, tags = ?, seo_title = ?, seo_description = ?, status = ?, published_at = ?,
        updated_at = ?, version = ?, last_updated_by = ?
       WHERE id = ?`
    ).bind(
      newSlug,
      body.title ?? existing.title,
      body.description ?? existing.description ?? '',
      body.imageUrl ?? existing.image_url ?? '',
      body.imageWidth ?? existing.image_width ?? 0,
      body.imageHeight ?? existing.image_height ?? 0,
      body.altText ?? existing.alt_text ?? '',
      JSON.stringify(Array.isArray(body.tags) ? body.tags : existingTags),
      body.seoTitle ?? existing.seo_title ?? '',
      body.seoDescription ?? existing.seo_description ?? '',
      newStatus,
      publishedAt,
      now,
      newVersion,
      updaterEmail,
      existing.id,
    ).run();

    const updated = await db.prepare('SELECT * FROM infographics WHERE id = ?').bind(existing.id).first();
    return Response.json(rowToInfographic(updated!));
  } catch (err: any) {
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(context: APIContext) {
  const env = context.locals.runtime.env;
  const db = env.DB;
  const slug = context.params.slug as string;

  const authError = await requireAuth(context.request, env);
  if (authError) return authError;

  const existing = await db.prepare('SELECT * FROM infographics WHERE slug = ?').bind(slug).first();
  if (!existing) {
    return Response.json({ error: 'Infographic not found' }, { status: 404 });
  }

  await db.prepare('DELETE FROM infographics WHERE id = ?').bind(existing.id).run();
  return Response.json({ success: true });
}
