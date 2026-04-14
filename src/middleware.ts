import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  let response = await next();
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Redirect responses are immutable on Cloudflare — clone to make headers writable
  if (response.status >= 300 && response.status < 400) {
    response = new Response(null, {
      status: response.status,
      headers: new Headers(response.headers),
    });
  }

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
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '));

  // /api/image/* serves user-facing images and must be indexable by Googlebot-Image
  const isPublicImage = path.startsWith('/api/image/');

  // Ensure public pages (and public images) are explicitly indexable
  if (isPublicImage || (!path.startsWith('/admin') && !path.startsWith('/api/'))) {
    if (!response.headers.has('X-Robots-Tag')) {
      response.headers.set('X-Robots-Tag', 'index, follow, max-image-preview:large');
    }
  }

  // Block admin and non-image API routes from indexing
  if (path.startsWith('/admin') || (path.startsWith('/api/') && !isPublicImage)) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
});
