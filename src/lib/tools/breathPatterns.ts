export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'hold2' | 'inhale2';

export interface BreathStep {
  phase: BreathPhase;
  seconds: number;
  label: string;
}

export interface BreathPattern {
  id: string;
  name: string;
  shortName: string;
  description: string;
  bestFor: string;
  steps: BreathStep[];
  /** Approximate breaths per minute for display */
  bpmHint?: string;
}

export const BREATH_PATTERNS: Record<string, BreathPattern> = {
  box: {
    id: 'box',
    name: 'Box Breathing',
    shortName: 'Box',
    description: 'Equal inhale, hold, exhale, and hold — a steady square rhythm used for focus under pressure.',
    bestFor: 'Focus and stress',
    steps: [
      { phase: 'inhale', seconds: 4, label: 'Inhale' },
      { phase: 'hold', seconds: 4, label: 'Hold' },
      { phase: 'exhale', seconds: 4, label: 'Exhale' },
      { phase: 'hold2', seconds: 4, label: 'Hold' },
    ],
    bpmHint: '~3.75 breaths/min',
  },
  '4-7-8': {
    id: '4-7-8',
    name: '4-7-8 Breathing',
    shortName: '4-7-8',
    description: 'Inhale for 4, hold for 7, exhale for 8 — a classic wind-down pattern for sleep and racing thoughts.',
    bestFor: 'Sleep and wind-down',
    steps: [
      { phase: 'inhale', seconds: 4, label: 'Inhale' },
      { phase: 'hold', seconds: 7, label: 'Hold' },
      { phase: 'exhale', seconds: 8, label: 'Exhale' },
    ],
  },
  sigh: {
    id: 'sigh',
    name: 'Physiological Sigh',
    shortName: 'Sigh',
    description: 'Double inhale through the nose, then a long slow exhale — a fast way to downshift stress in 1–3 breaths.',
    bestFor: 'Instant calm',
    steps: [
      { phase: 'inhale', seconds: 2, label: 'Inhale' },
      { phase: 'inhale2', seconds: 1, label: 'Top-up' },
      { phase: 'exhale', seconds: 6, label: 'Long exhale' },
    ],
  },
  coherent: {
    id: 'coherent',
    name: 'Coherent Breathing',
    shortName: 'Coherent',
    description: 'Even inhale and exhale near 5.5 seconds each — about six breaths per minute for steady nervous-system balance.',
    bestFor: 'HRV and resilience',
    steps: [
      { phase: 'inhale', seconds: 5.5, label: 'Inhale' },
      { phase: 'exhale', seconds: 5.5, label: 'Exhale' },
    ],
    bpmHint: '~5.5 breaths/min',
  },
};

export type BreathPatternId = keyof typeof BREATH_PATTERNS;

export function getPattern(id: string): BreathPattern {
  return BREATH_PATTERNS[id] ?? BREATH_PATTERNS.box;
}

export function cycleDuration(pattern: BreathPattern): number {
  return pattern.steps.reduce((sum, s) => sum + s.seconds, 0);
}
