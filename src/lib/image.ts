import { SITE_URL } from './xml';

type FitMode = 'cover' | 'contain' | 'scale-down' | 'crop' | 'pad';

export interface ImageOptions {
  width: number;
  height?: number;
  quality?: number;
  fit?: FitMode;
  format?: 'auto' | 'webp' | 'avif';
}

const DEFAULT_QUALITY = 80;
const DEFAULT_FIT: FitMode = 'cover';
const DEFAULT_FORMAT: ImageOptions['format'] = 'auto';

// Only same-origin /api/image/ paths are transformed. External URLs
// (R2 public URL, YouTube thumbnails, etc.) pass through unchanged because
// CF Transformations on a Free zone is restricted to same-zone sources.
function canTransform(src: string): boolean {
  if (!src) return false;
  return src.startsWith('/api/image/');
}

function buildOptions(opts: ImageOptions): string {
  const parts = [
    `format=${opts.format ?? DEFAULT_FORMAT}`,
    `width=${Math.round(opts.width)}`,
    `quality=${opts.quality ?? DEFAULT_QUALITY}`,
    `fit=${opts.fit ?? DEFAULT_FIT}`,
  ];
  if (opts.height) parts.push(`height=${Math.round(opts.height)}`);
  return parts.join(',');
}

// Always absolute. /cdn-cgi/image/ is enabled only on the prod zone, so
// preview deploys (*.pages.dev, hash subdomains) must point at prod for
// transforms. Prod renders cross to itself with a full host — negligible
// HTML overhead, no CORS implications since both endpoints are same-origin
// from the browser's POV when on prod, and CF still caches per-key.
function transformUrl(src: string, opts: ImageOptions): string {
  return `${SITE_URL}/cdn-cgi/image/${buildOptions(opts)}${src}`;
}

export function optimizedImage(src: string | undefined | null, opts: ImageOptions): string {
  if (!src) return '';
  if (!canTransform(src)) return src;
  return transformUrl(src, opts);
}

export function optimizedSrcSet(
  src: string | undefined | null,
  widths: number[],
  opts: Omit<ImageOptions, 'width'> = {},
): string {
  if (!src || !canTransform(src)) return '';
  const unique = Array.from(new Set(widths.map((w) => Math.round(w)))).sort((a, b) => a - b);
  return unique.map((w) => `${transformUrl(src, { ...opts, width: w })} ${w}w`).join(', ');
}

/**
 * Absolute (origin-prefixed) transformed URL for og:image, twitter:image,
 * Schema.org image fields, RSS enclosures, etc. — anywhere the URL is read
 * by an external consumer (Facebook scraper, Google bot, RSS reader).
 *
 * Pass-throughs cover external sources (YouTube thumbs, full https URLs)
 * and missing sources (returns SITE_URL + fallback).
 */
export function optimizedImageAbs(
  src: string | undefined | null,
  opts: ImageOptions,
  fallback = '/meditation.png',
): string {
  if (!src) return `${SITE_URL}${fallback}`;
  if (/^https?:\/\//i.test(src)) return src;
  if (canTransform(src)) return transformUrl(src, opts);
  return `${SITE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
}
