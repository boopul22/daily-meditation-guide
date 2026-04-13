import { SITE_URL } from './xml';

export function absoluteImage(src: string, fallback = '/meditation.png'): string {
  if (!src) return `${SITE_URL}${fallback}`;
  if (/^https?:\/\//i.test(src)) return src;
  return `${SITE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
}
