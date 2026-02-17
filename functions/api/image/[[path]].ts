import { Env } from '../../types';

// GET /api/image/uploads/... — serve images from R2
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pathSegments = context.params.path;
  if (!pathSegments) {
    return new Response('Not found', { status: 404 });
  }

  const key = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments;

  const object = await context.env.R2.get(key);
  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('ETag', object.httpEtag);

  return new Response(object.body, { headers });
};
