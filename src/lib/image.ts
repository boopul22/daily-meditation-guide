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

// Cloudflare Image Resizing (/cdn-cgi/image/...) requires a Pro plan or a
// Cloudflare Images subscription. This zone is on the Free plan, so those
// transform URLs 404 in production. Return the original src and skip srcset
// until the plan is upgraded or Cloudflare Images is enabled.
export function optimizedImage(src: string | undefined | null, _opts: ImageOptions): string {
  return src ?? '';
}

export function optimizedSrcSet(
  _src: string | undefined | null,
  _widths: number[],
  _opts: Omit<ImageOptions, 'width'> = {},
): string {
  return '';
}

void canTransform;
void buildOptions;
