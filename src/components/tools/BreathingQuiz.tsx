import React, { useMemo, useState } from 'react';

type Goal = 'sleep' | 'anxiety' | 'focus' | 'energy';
type Time = '1' | '3' | '5' | '10';
type Style = 'gentle' | 'structured' | 'fast';

const QUESTIONS: {
  id: string;
  prompt: string;
  options: { label: string; value: string }[];
}[] = [
  {
    id: 'goal',
    prompt: 'What do you need right now?',
    options: [
      { label: 'Fall asleep / wind down', value: 'sleep' },
      { label: 'Calm anxiety or panic', value: 'anxiety' },
      { label: 'Focus before work', value: 'focus' },
      { label: 'Quick energy reset', value: 'energy' },
    ],
  },
  {
    id: 'time',
    prompt: 'How long can you give this?',
    options: [
      { label: 'About 1 minute', value: '1' },
      { label: '2–3 minutes', value: '3' },
      { label: '5 minutes', value: '5' },
      { label: '10 minutes', value: '10' },
    ],
  },
  {
    id: 'style',
    prompt: 'What feels better?',
    options: [
      { label: 'Soft and gentle', value: 'gentle' },
      { label: 'Clear structure (count with me)', value: 'structured' },
      { label: 'Fastest possible relief', value: 'fast' },
    ],
  },
  {
    id: 'eyes',
    prompt: 'Can you watch a screen?',
    options: [
      { label: 'Yes, visuals help', value: 'visual' },
      { label: 'Prefer eyes closed / audio', value: 'audio' },
    ],
  },
];

type Result = {
  title: string;
  reason: string;
  href: string;
  pattern: string;
  sessionsHref: string;
};

function recommend(answers: Record<string, string>): Result {
  const goal = answers.goal as Goal;
  const time = answers.time as Time;
  const style = answers.style as Style;

  if (style === 'fast' || (goal === 'anxiety' && time === '1')) {
    return {
      title: 'Physiological Sigh',
      reason: 'A double inhale and long exhale can settle stress in just a few breaths.',
      href: '/tools/physiological-sigh',
      pattern: 'sigh',
      sessionsHref: '/category/anxiety',
    };
  }
  if (goal === 'sleep' || (goal === 'anxiety' && style === 'gentle')) {
    return {
      title: '4-7-8 Breathing',
      reason: 'The long exhale helps your nervous system downshift for sleep and wind-down.',
      href: '/tools/4-7-8-breathing-timer',
      pattern: '4-7-8',
      sessionsHref: '/category/sleep',
    };
  }
  if (goal === 'focus' || style === 'structured') {
    return {
      title: 'Box Breathing',
      reason: 'Equal counts keep attention steady without making you sleepy.',
      href: '/tools/box-breathing-timer',
      pattern: 'box',
      sessionsHref: '/category/focus',
    };
  }
  if (goal === 'energy') {
    return {
      title: 'Coherent Breathing',
      reason: 'A balanced rhythm clears fog without the jitter of hard breathwork.',
      href: '/tools/coherent-breathing',
      pattern: 'coherent',
      sessionsHref: '/category/breathwork',
    };
  }
  return {
    title: 'Box Breathing',
    reason: 'A reliable default when you want calm focus.',
    href: '/tools/box-breathing-timer',
    pattern: 'box',
    sessionsHref: '/category/breathwork',
  };
}

const BreathingQuiz: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);

  const result = useMemo(() => (finished ? recommend(answers) : null), [finished, answers]);

  const pick = (value: string) => {
    const q = QUESTIONS[index];
    const nextAnswers = { ...answers, [q.id]: value };
    setAnswers(nextAnswers);
    if (index >= QUESTIONS.length - 1) {
      setFinished(true);
      try {
        const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
        if (typeof gtag === 'function') gtag('event', 'tool_quiz_complete', { result: recommend(nextAnswers).pattern });
      } catch {
        /* ignore */
      }
    } else {
      setIndex(index + 1);
    }
  };

  const restart = () => {
    setIndex(0);
    setAnswers({});
    setFinished(false);
  };

  if (finished && result) {
    return (
      <div className="text-center space-y-5 py-4">
        <p className="text-xs uppercase tracking-widest text-indigo-400">Your match</p>
        <h2 className="font-display text-3xl text-zinc-100">{result.title}</h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">{result.reason}</p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <a href={result.href} className="px-5 py-2.5 rounded-full bg-zinc-100 text-zinc-950 text-sm font-medium">
            Open free timer
          </a>
          <a
            href={result.sessionsHref}
            className="px-5 py-2.5 rounded-full border border-white/10 text-sm text-zinc-300"
          >
            Guided sessions
          </a>
          <button type="button" onClick={restart} className="px-4 py-2 text-xs text-zinc-500 hover:text-zinc-300">
            Retake quiz
          </button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[index];
  return (
    <div className="space-y-6">
      <div className="flex justify-between text-xs text-zinc-500">
        <span>
          Question {index + 1} / {QUESTIONS.length}
        </span>
        <span>{Math.round((index / QUESTIONS.length) * 100)}%</span>
      </div>
      <h2 className="font-display text-2xl text-zinc-100 text-center">{q.prompt}</h2>
      <div className="grid gap-2 max-w-lg mx-auto">
        {q.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => pick(opt.value)}
            className="text-left px-4 py-3 rounded-2xl border border-white/10 bg-zinc-950/40 text-sm text-zinc-200 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-colors"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BreathingQuiz;
