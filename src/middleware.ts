import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Security headers for all responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  // Content Security Policy
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://code.iconify.design https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' https://pub-141831e61e69445289222976a15b6fb3.r2.dev https://img.youtube.com data:",
    "connect-src 'self' https://api.iconify.design https://cloudflareinsights.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "require-trusted-types-for 'script'",
  ].join('; '));

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
