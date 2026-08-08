export type ToolIntent = 'anxiety' | 'sleep' | 'focus' | 'general';

export interface ToolDef {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  href: string;
  intent: ToolIntent[];
  categoryKey: string;
  icon: string;
  accent: string;
  /** Breath pattern id when this page embeds BreathPacer */
  patternId?: string;
  featured?: boolean;
}

export const TOOLS: ToolDef[] = [
  {
    slug: 'box-breathing-timer',
    title: 'Box Breathing Timer',
    shortTitle: 'Box Breathing',
    description: 'Free online 4-4-4-4 breath pacer with audio cues. No signup.',
    href: '/tools/box-breathing-timer',
    intent: ['focus', 'anxiety'],
    categoryKey: 'breathwork',
    icon: 'solar:widget-4-linear',
    accent: '#88C9A1',
    patternId: 'box',
    featured: true,
  },
  {
    slug: '4-7-8-breathing-timer',
    title: '4-7-8 Breathing Timer',
    shortTitle: '4-7-8',
    description: 'Guided 4-7-8 breathing for sleep and wind-down. Free browser timer.',
    href: '/tools/4-7-8-breathing-timer',
    intent: ['sleep', 'anxiety'],
    categoryKey: 'sleep',
    icon: 'solar:moon-sleep-linear',
    accent: '#7C6BFF',
    patternId: '4-7-8',
    featured: true,
  },
  {
    slug: 'physiological-sigh',
    title: 'Physiological Sigh Timer',
    shortTitle: 'Physiological Sigh',
    description: 'Double-inhale, long-exhale stress reset. Follow the free visual pacer.',
    href: '/tools/physiological-sigh',
    intent: ['anxiety'],
    categoryKey: 'anxiety',
    icon: 'solar:wind-linear',
    accent: '#48C9B0',
    patternId: 'sigh',
    featured: true,
  },
  {
    slug: 'coherent-breathing',
    title: 'Coherent Breathing Timer',
    shortTitle: 'Coherent Breathing',
    description: 'About six breaths per minute for steady calm and HRV practice.',
    href: '/tools/coherent-breathing',
    intent: ['focus', 'general'],
    categoryKey: 'breathwork',
    icon: 'solar:heart-pulse-linear',
    accent: '#88C9A1',
    patternId: 'coherent',
  },
  {
    slug: 'grounding-5-4-3-2-1',
    title: '5-4-3-2-1 Grounding Exercise',
    shortTitle: '5-4-3-2-1 Grounding',
    description: 'Interactive sensory grounding walkthrough for anxiety and overwhelm.',
    href: '/tools/grounding-5-4-3-2-1',
    intent: ['anxiety'],
    categoryKey: 'anxiety',
    icon: 'solar:hand-heart-linear',
    accent: '#48C9B0',
    featured: true,
  },
  {
    slug: 'breathing-technique-quiz',
    title: 'Which Breathing Technique?',
    shortTitle: 'Breathing Quiz',
    description: '30-second quiz that recommends the right breath pattern for your goal.',
    href: '/tools/breathing-technique-quiz',
    intent: ['general', 'anxiety', 'sleep', 'focus'],
    categoryKey: 'breathwork',
    icon: 'solar:question-circle-linear',
    accent: '#c49245',
    featured: true,
  },
  {
    slug: 'cognitive-shuffle',
    title: 'Cognitive Shuffle Sleep Generator',
    shortTitle: 'Cognitive Shuffle',
    description: 'Random neutral words to quiet racing thoughts at bedtime.',
    href: '/tools/cognitive-shuffle',
    intent: ['sleep'],
    categoryKey: 'sleep',
    icon: 'solar:text-linear',
    accent: '#7C6BFF',
  },
  {
    slug: 'pmr-timer',
    title: 'Progressive Muscle Relaxation Timer',
    shortTitle: 'PMR Timer',
    description: 'Timed body-part release sequence for tension and sleep.',
    href: '/tools/pmr-timer',
    intent: ['sleep', 'anxiety'],
    categoryKey: 'sleep',
    icon: 'solar:body-shape-linear',
    accent: '#7C6BFF',
  },
  {
    slug: 'session-finder',
    title: 'Meditation Session Finder',
    shortTitle: 'Session Finder',
    description: 'Pick your goal and minutes — get a matching guided session from our library.',
    href: '/tools/session-finder',
    intent: ['general', 'sleep', 'anxiety', 'focus'],
    categoryKey: 'guided',
    icon: 'solar:magnifer-linear',
    accent: '#c49245',
  },
  {
    slug: 'streak',
    title: 'Meditation Streak Tracker',
    shortTitle: 'Streak Lite',
    description: 'Private local-only streak tracker. No account, no cloud.',
    href: '/tools/streak',
    intent: ['general'],
    categoryKey: 'mindfulness',
    icon: 'solar:calendar-mark-linear',
    accent: '#F4B860',
  },
  {
    slug: 'meditation-cost-calculator',
    title: 'Meditation App Cost Calculator',
    shortTitle: 'Cost Calculator',
    description: 'See what Calm or Headspace costs yearly — and free alternatives.',
    href: '/tools/meditation-cost-calculator',
    intent: ['general'],
    categoryKey: 'mindfulness',
    icon: 'solar:calculator-linear',
    accent: '#E36A70',
  },
];

export const TOOL_HREF_LASTMOD = '2026-08-08';

export function getTool(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function toolsByIntent(intent: ToolIntent | 'all'): ToolDef[] {
  if (intent === 'all') return TOOLS;
  return TOOLS.filter((t) => t.intent.includes(intent));
}

export function featuredTools(): ToolDef[] {
  return TOOLS.filter((t) => t.featured);
}
