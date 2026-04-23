type FitMode = 'cover' | 'contain' | 'scale-down' | 'crop' | 'pad';

interface ImageOptions {
  width: number;
  height?: number;
  quality?: number;
  fit?: FitMode;
  format?: 'auto' | 'webp' | 'avif';
}

const DEFAULT_QUALITY = 75;
const DEFAULT_FIT: FitMode = 'cover';
const DEFAULT_FORMAT = 'auto';
const TRANSFORMABLE_PREFIXES = ['/api/image/', 'https://pub-141831e61e69445289222976a15b6fb3.r2.dev/'];

function canTransform(src: string): boolean {
  if (!src) return false;
  return TRANSFORMABLE_PREFIXES.some((p) => src.startsWith(p));
}

function buildOptions(opts: ImageOptions): string {
  const parts: string[] = [
    `format=${opts.format ?? DEFAULT_FORMAT}`,
    `width=${Math.round(opts.width)}`,
    `quality=${opts.quality ?? DEFAULT_QUALITY}`,
    `fit=${opts.fit ?? DEFAULT_FIT}`,
  ];
  if (opts.height) parts.push(`height=${Math.round(opts.height)}`);
  return parts.join(',');
}

export function optimizedImage(src: string | undefined | null, opts: ImageOptions): string {
  if (!src || !canTransform(src)) return src ?? '';
  return `/cdn-cgi/image/${buildOptions(opts)}${src.startsWith('/') ? src : '/' + src}`;
}

export function optimizedSrcSet(
  src: string | undefined | null,
  widths: number[],
  opts: Omit<ImageOptions, 'width'> = {},
): string {
  if (!src || !canTransform(src)) return '';
  return widths
    .map((w) => `${optimizedImage(src, { ...opts, width: w })} ${w}w`)
    .join(', ');
}
