export const SITE_URL = 'https://dailymeditationguide.com';
export const SITE_NAME = 'Daily Meditation Guide';
export const SITE_DESCRIPTION =
  'Your daily guide to mindfulness and meditation. Curated audio journeys to help you focus, sleep, and reset.';

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function toW3CDate(dateStr: string): string {
  const d = new Date(dateStr.includes('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z');
  return d.toISOString().split('.')[0] + 'Z';
}

export function toRFC2822(dateStr: string): string {
  const d = new Date(dateStr.includes('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z');
  return d.toUTCString();
}
