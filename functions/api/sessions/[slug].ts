import { Env, SessionRow } from '../../types';
import { requireAuth, isAdmin } from '../../lib/auth';
import { verifyCFAccessJWT } from '../../lib/cfaccess';
import { rowToAPI } from '../../lib/db';

export const onRequestGet: PagesFunction<Env> = async ({ params, request, env }) => {
  const slug = params.slug as string;

  const row = await env.DB.prepare('SELECT * FROM sessions WHERE slug = ?')
    .bind(slug)
    .first<SessionRow>();

  if (!row) {
    return Response.json({ error: 'Session not found' }, { status: 404 });
  }

  // Non-admin users can only see published sessions
  if (row.status !== 'published' && !(await isAdmin(request, env))) {
    return Response.json({ error: 'Session not found' }, { status: 404 });
  }

  return Response.json(rowToAPI(row));
};

export const onRequestPut: PagesFunction<Env> = async ({ params, request, env }) => {
  const authError = await requireAuth(request, env);
  if (authError) return authError;

  const slug = params.slug as string;

  try {
    const body = await request.json<any>();
    const now = new Date().toISOString();

    const existing = await env.DB.prepare('SELECT * FROM sessions WHERE slug = ?')
      .bind(slug)
      .first<SessionRow>();

    if (!existing) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Optimistic locking: check version unless force-saving
    const incomingVersion = body.version;
    if (incomingVersion !== undefined && incomingVersion !== null && !body.forceSave) {
      if (existing.version !== incomingVersion) {
        return Response.json({
          error: 'Conflict: this session was modified by another admin',
          conflict: true,
          currentData: rowToAPI(existing),
        }, { status: 409 });
      }
    }

    // Get current user email for audit
    const jwtPayload = await verifyCFAccessJWT(request, env);
    const updaterEmail = jwtPayload?.email || null;

    // Sanitize and validate slug if being changed
    let newSlug = existing.slug;
    if (body.slug !== undefined && body.slug !== null) {
      newSlug = (body.slug || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!newSlug) {
        return Response.json({ error: 'Slug is required' }, { status: 400 });
      }
      // Check for duplicate slug (only if slug is changing)
      if (newSlug !== existing.slug) {
        const conflicting = await env.DB.prepare('SELECT id FROM sessions WHERE slug = ? AND id != ?')
          .bind(newSlug, existing.id)
          .first();
        if (conflicting) {
          return Response.json({ error: `A session with slug "${newSlug}" already exists` }, { status: 409 });
        }
      }
    }

    let existingRelated: string[] = [];
    try {
      existingRelated = existing.related_sessions ? JSON.parse(existing.related_sessions) : [];
    } catch {
      existingRelated = [];
    }

    // Determine new status and published_at
    const newStatus = body.status ?? existing.status ?? 'draft';
    let publishedAt = existing.published_at;

    // Set published_at when transitioning to published for the first time
    if (newStatus === 'published' && existing.status !== 'published') {
      publishedAt = now;
    }
    // Clear published_at when unpublishing
    if (newStatus === 'draft') {
      publishedAt = null;
    }

    let existingFaq: any[] = [];
    try {
      existingFaq = existing.faq_items ? JSON.parse(existing.faq_items) : [];
    } catch {
      existingFaq = [];
    }

    const newVersion = (existing.version ?? 1) + 1;

    await env.DB.prepare(
      `UPDATE sessions SET
        slug = ?, title = ?, author = ?, role = ?, duration = ?, duration_sec = ?,
        category = ?, color = ?, description = ?, featured_image = ?, audio_url = ?,
        full_content = ?, related_sessions = ?, faq_items = ?, status = ?, published_at = ?,
        updated_at = ?, version = ?, last_updated_by = ?
       WHERE id = ?`
    ).bind(
      newSlug,
      body.title ?? existing.title,
      body.author ?? existing.author,
      body.role ?? existing.role,
      body.duration ?? existing.duration,
      body.durationSec ?? existing.duration_sec,
      body.category ?? existing.category,
      body.color ?? existing.color,
      body.description ?? existing.description,
      body.featuredImage ?? existing.featured_image ?? '',
      body.audioUrl ?? existing.audio_url ?? '',
      body.fullContent ?? existing.full_content ?? '',
      JSON.stringify(body.relatedSessions ?? existingRelated),
      JSON.stringify(body.faqItems ?? existingFaq),
      newStatus,
      publishedAt,
      now,
      newVersion,
      updaterEmail,
      existing.id
    ).run();

    const updated = await env.DB.prepare('SELECT * FROM sessions WHERE id = ?')
      .bind(existing.id)
      .first<SessionRow>();

    return Response.json(rowToAPI(updated!));
  } catch (err: any) {
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ params, request, env }) => {
  const authError = await requireAuth(request, env);
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
