export interface CategoryDef {
  key: string;
  label: string;
  keywords: RegExp;
  kicker: string;
  tagline: string;
  description: string;
  accent: string;
  accentGlow: string;
  audioAliases: string[];
}

export const VIDEO_CATEGORIES: CategoryDef[] = [
  {
    key: 'sleep',
    label: 'Sleep & Rest',
    keywords: /\b(sleep|insomnia|bedtime|nighttime|night\b|fall asleep|deep rest|restful|unwind)/i,
    kicker: 'For the quiet hours',
    tagline: 'Drift into deep, unbroken rest.',
    description:
      'Guided meditations engineered to slow a racing mind, release the body into stillness, and carry you gently across the border into sleep. For restless nights, long days, and anything in between.',
    accent: '#7C6BFF',
    accentGlow: 'rgba(124, 107, 255, 0.28)',
    audioAliases: ['sleep'],
  },
  {
    key: 'anxiety',
    label: 'Anxiety & Stress Relief',
    keywords: /\b(anxi|panic|stress|fear|worry|overthink|calm|reset|recenter|peace|balance)/i,
    kicker: 'When the storm is loudest',
    tagline: 'Soften the edges of a pressured day.',
    description:
      'Grounding practices for when the chest tightens and the mind will not rest. Simple, spoken, and paced to meet you exactly where you are — without pressure, without performance.',
    accent: '#48C9B0',
    accentGlow: 'rgba(72, 201, 176, 0.28)',
    audioAliases: ['anxiety', 'stress'],
  },
  {
    key: 'morning',
    label: 'Morning & Energy',
    keywords: /\b(morning|wake|awaken|start your day|dawn|sunrise|energiz|energy)/i,
    kicker: 'Meet the first light',
    tagline: 'Begin the day deliberate, not reactive.',
    description:
      'Short, awake-making meditations for the first moments after rising. Warm breath, steady intention, and a clearer sense of what this day is actually asking of you.',
    accent: '#F4B860',
    accentGlow: 'rgba(244, 184, 96, 0.28)',
    audioAliases: ['morning'],
  },
  {
    key: 'focus',
    label: 'Focus & Clarity',
    keywords: /\b(focus|clarity|concentra|productiv|sharpen|procrastinat|study|deep work)/i,
    kicker: 'Collect the scattered mind',
    tagline: 'Sharpen attention without forcing it.',
    description:
      'Brief, precise sessions to cut through mental noise — pre-work, pre-study, pre-anything-that-matters. Lightweight frameworks you can use in five minutes and carry for an hour.',
    accent: '#E36A70',
    accentGlow: 'rgba(227, 106, 112, 0.28)',
    audioAliases: ['focus', 'clarity'],
  },
  {
    key: 'breathwork',
    label: 'Breathwork',
    keywords: /\b(breath|pranayama|inhale|exhale)/i,
    kicker: 'The oldest medicine',
    tagline: 'Breath as the shortest path back to yourself.',
    description:
      'Guided breath patterns — box, 4-7-8, alternate-nostril, coherence — with clear cueing and no esoteric overhead. Just teachable rhythms that regulate your nervous system on demand.',
    accent: '#88C9A1',
    accentGlow: 'rgba(136, 201, 161, 0.28)',
    audioAliases: ['breathwork', 'breath'],
  },
  {
    key: 'self-love',
    label: 'Self-Love & Compassion',
    keywords: /\b(self[\s-]?love|compassion|loving[\s-]?kindness|metta|heart\b|kindness|self[\s-]?worth|confidence|self-discovery|self-acceptance)/i,
    kicker: 'A steadier relationship with yourself',
    tagline: 'Offer yourself the voice you would offer a friend.',
    description:
      'Metta, loving-kindness, and self-compassion practices for the moments when the inner critic gets the loudest. Quiet, deliberate, and grounded in the work of Kristin Neff and the Buddhist tradition.',
    accent: '#F2A5D0',
    accentGlow: 'rgba(242, 165, 208, 0.28)',
    audioAliases: ['self-love', 'self love', 'compassion'],
  },
  {
    key: 'healing',
    label: 'Emotional Healing',
    keywords: /\b(heal|release|forgiv|let go|emotional|trauma|grief|inner child|shadow work)/i,
    kicker: 'Room for what is unresolved',
    tagline: 'Sit with what hurts without drowning in it.',
    description:
      'Trauma-informed meditations for grief, release, and slow emotional repair. Paced carefully. Not a substitute for therapy, but a steady companion beside it.',
    accent: '#C89B8D',
    accentGlow: 'rgba(200, 155, 141, 0.28)',
    audioAliases: ['healing', 'grief'],
  },
  {
    key: 'mindfulness',
    label: 'Mindfulness & Presence',
    keywords: /\b(mindful|presence|present|awareness|walking|body scan|noting)/i,
    kicker: 'The art of being here',
    tagline: 'Notice the life you are already inside of.',
    description:
      'Body scans, walking meditations, and open-awareness practices in the classical mindfulness tradition — Kabat-Zinn, Thich Nhat Hanh, MBSR. Precise instruction, no mysticism, lasting effect.',
    accent: '#9AB5D4',
    accentGlow: 'rgba(154, 181, 212, 0.28)',
    audioAliases: ['mindfulness', 'presence'],
  },
  {
    key: 'manifestation',
    label: 'Manifestation & Intention',
    keywords: /\b(manifest|intention|visualiz|abundance|gratitude|creativ|affirm|dream)/i,
    kicker: 'From direction to devotion',
    tagline: 'Set an intention with the whole body, not just the head.',
    description:
      'Visualization and intention-setting meditations for writers, builders, and anyone shaping a next chapter. Grounded in imagery and gratitude — not magical thinking.',
    accent: '#D4A96A',
    accentGlow: 'rgba(212, 169, 106, 0.28)',
    audioAliases: ['manifestation', 'intention', 'gratitude'],
  },
];

const FALLBACK_CATEGORY: CategoryDef = {
  key: 'guided',
  label: 'Guided Meditations',
  keywords: /.*/,
  kicker: 'The wider library',
  tagline: 'Meditations that defy easy labels.',
  description:
    'Sessions that do not fit a single theme — longer arcs, hybrid practices, and experimental guides. A home for everything else.',
  accent: '#C0C4C8',
  accentGlow: 'rgba(192, 196, 200, 0.22)',
  audioAliases: [],
};

export const ALL_CATEGORIES: CategoryDef[] = [...VIDEO_CATEGORIES, FALLBACK_CATEGORY];

export function categorize(title: string, description: string = ''): CategoryDef {
  const haystack = `${title}\n${description}`;
  for (const cat of VIDEO_CATEGORIES) {
    if (cat.keywords.test(haystack)) return cat;
  }
  return FALLBACK_CATEGORY;
}

export function getCategoryByKey(key: string): CategoryDef | null {
  return ALL_CATEGORIES.find((c) => c.key === key) ?? null;
}

// Check whether a freeform audio-session category string maps to a video category key.
export function audioCategoryMatches(audioCategory: string, videoKey: string): boolean {
  const cat = getCategoryByKey(videoKey);
  if (!cat) return false;
  const normalized = audioCategory.trim().toLowerCase();
  return cat.audioAliases.some((alias) => alias === normalized);
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
