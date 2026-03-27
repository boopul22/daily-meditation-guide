import { Env } from '../../types';

// GET /api/image/uploads/... — serve images from R2
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pathSegments = context.params.path;
  if (!pathSegments) {
    return new Response('Not found', { status: 404 });
  }

  const key = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;

  const object = await context.env.R2.get(key);
  if (object) {
    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('ETag', object.httpEtag);
    return new Response(object.body, { headers });
  }

  // Fallback: fetch from R2 public URL (useful for local dev where R2 is empty)
  if (context.env.R2_PUBLIC_URL) {
    const fallbackUrl = `${context.env.R2_PUBLIC_URL}/${key}`;
    const fallbackRes = await fetch(fallbackUrl);
    if (fallbackRes.ok) {
      const headers = new Headers();
      headers.set('Content-Type', fallbackRes.headers.get('Content-Type') || 'application/octet-stream');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      return new Response(fallbackRes.body, { headers });
    }
  }

  return new Response('Not found', { status: 404 });
};
