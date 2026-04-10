import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Security headers for all responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Ensure public pages are explicitly indexable
  if (!path.startsWith('/admin') && !path.startsWith('/api/')) {
    // Don't override if the page already sets a robots meta (noindex pages like privacy/terms)
    // This header acts as a safety net for SSR pages
    if (!response.headers.has('X-Robots-Tag')) {
      response.headers.set('X-Robots-Tag', 'index, follow');
    }
  }

  // Block admin and API routes from indexing
  if (path.startsWith('/admin') || path.startsWith('/api/')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
});
