export interface CategoryDef {
  key: string;
  label: string;
  keywords: RegExp;
}

export const VIDEO_CATEGORIES: CategoryDef[] = [
  { key: 'sleep', label: 'Sleep & Rest', keywords: /\b(sleep|insomnia|bedtime|night|fall asleep|deep rest|nighttime)\b/i },
  { key: 'anxiety', label: 'Anxiety & Stress Relief', keywords: /\b(anxiety|panic|stress|fear|worry|overthink|calm)\b/i },
  { key: 'morning', label: 'Morning & Energy', keywords: /\b(morning|wake|awaken|start your day|dawn|sunrise|energize|energy)\b/i },
  { key: 'focus', label: 'Focus & Clarity', keywords: /\b(focus|clarity|concentration|productivity|mental|sharpen|procrastination)\b/i },
  { key: 'breathwork', label: 'Breathwork', keywords: /\b(breath|breathwork|pranayama|breathing)\b/i },
  { key: 'self-love', label: 'Self-Love & Compassion', keywords: /\b(self[\s-]?love|compassion|loving[\s-]?kindness|metta|heart|kindness|self[\s-]?worth|confidence)\b/i },
  { key: 'healing', label: 'Emotional Healing', keywords: /\b(heal|release|forgiv|let go|emotional|trauma|grief)\b/i },
  { key: 'mindfulness', label: 'Mindfulness & Presence', keywords: /\b(mindful|presence|present|awareness|walking)\b/i },
  { key: 'manifestation', label: 'Manifestation & Intention', keywords: /\b(manifest|intention|visualiz|abundance|gratitude|creative)\b/i },
];

const FALLBACK_CATEGORY: CategoryDef = {
  key: 'guided',
  label: 'Guided Meditations',
  keywords: /.*/,
};

export function categorize(title: string, description: string = ''): CategoryDef {
  const haystack = `${title}\n${description}`;
  for (const cat of VIDEO_CATEGORIES) {
    if (cat.keywords.test(haystack)) return cat;
  }
  return FALLBACK_CATEGORY;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 70)
    .replace(/^-|-$/g, '');
}

export function videoSlug(title: string, videoId: string): string {
  const base = slugify(title) || 'video';
  const suffix = videoId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toLowerCase();
  return `${base}-${suffix}`;
}

// Strip common markdown syntax from YouTube descriptions so they render cleanly
// as plain text. Keeps the text, drops the markers.
export function cleanDescription(raw: string): string {
  if (!raw) return '';
  let text = raw;
  // Remove markdown horizontal rules and trailing/leading divider lines
  text = text.replace(/^\s*[-_*]{3,}\s*$/gm, '');
  // Collapse heading markers (# Heading → Heading)
  text = text.replace(/^\s{0,3}#{1,6}\s+/gm, '');
  // Bold / italic: **x** __x__ *x* _x_ → x
  text = text.replace(/\*\*([^*\n]+)\*\*/g, '$1');
  text = text.replace(/__([^_\n]+)__/g, '$1');
  text = text.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '$1');
  text = text.replace(/(?<!_)_([^_\n]+)_(?!_)/g, '$1');
  // Inline code `x` → x
  text = text.replace(/`([^`\n]+)`/g, '$1');
  // List markers at line start: "- ", "* ", "+ ", "1. " → "• "
  text = text.replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '• ');
  // Links [text](url) → text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Collapse excessive blank lines (3+ → 2)
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

// Note: use img.youtube.com (not i.ytimg.com) because it's whitelisted in CSP.
// hqdefault.jpg is the highest resolution guaranteed to exist for every YouTube video.
export function thumbnailUrl(videoId: string, size: 'hq' | 'mq' = 'hq'): string {
  const map = { hq: 'hqdefault', mq: 'mqdefault' } as const;
  return `https://img.youtube.com/vi/${videoId}/${map[size]}.jpg`;
}
