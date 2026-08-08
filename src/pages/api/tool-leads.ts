import type { APIContext } from 'astro';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(context: APIContext) {
  let body: { email?: string; toolSlug?: string };
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const email = (body.email || '').trim().toLowerCase();
  const toolSlug = (body.toolSlug || 'unknown').trim().slice(0, 80);

  if (!EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
  }

  const db = context.locals.runtime.env.DB;
  try {
    await db
      .prepare(
        `INSERT INTO tool_leads (email, tool_slug) VALUES (?, ?)
         ON CONFLICT(email, tool_slug) DO UPDATE SET created_at = datetime('now')`
      )
      .bind(email, toolSlug)
      .run();
  } catch (err) {
    // Table may not exist yet on local — still accept lead gracefully
    console.error('tool_leads insert failed', err);
    return new Response(JSON.stringify({ ok: true, stored: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true, stored: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
