import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const env = context.locals.runtime.env;
  const pathParam = context.params.path;

  if (!pathParam) {
    return new Response('Not found', { status: 404 });
  }

  const key = pathParam;

  const object = await env.R2.get(key);
  if (object) {
    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('ETag', object.httpEtag);
    return new Response(object.body, { headers });
  }

  // Fallback: fetch from R2 public URL (useful for local dev where R2 is empty)
  if (env.R2_PUBLIC_URL) {
    const fallbackUrl = `${env.R2_PUBLIC_URL}/${key}`;
    const fallbackRes = await fetch(fallbackUrl);
    if (fallbackRes.ok) {
      const headers = new Headers();
      headers.set('Content-Type', fallbackRes.headers.get('Content-Type') || 'application/octet-stream');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      return new Response(fallbackRes.body, { headers });
    }
  }

  return new Response('Not found', { status: 404 });
}
