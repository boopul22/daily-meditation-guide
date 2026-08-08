import React, { useState } from 'react';

const STEPS = [
  {
    count: 5,
    sense: 'see',
    prompt: 'Name 5 things you can see',
    hint: 'Look around slowly — colors, shapes, light, objects near and far.',
  },
  {
    count: 4,
    sense: 'feel',
    prompt: 'Name 4 things you can feel',
    hint: 'Feet on the floor, fabric on skin, temperature, the chair beneath you.',
  },
  {
    count: 3,
    sense: 'hear',
    prompt: 'Name 3 things you can hear',
    hint: 'Near sounds, far sounds, even the quiet hum of the room.',
  },
  {
    count: 2,
    sense: 'smell',
    prompt: 'Name 2 things you can smell',
    hint: 'Air, soap, coffee, outdoors — or recall a familiar scent if none are strong.',
  },
  {
    count: 1,
    sense: 'taste',
    prompt: 'Name 1 thing you can taste',
    hint: 'Toothpaste, tea, or simply the neutral taste in your mouth.',
  },
] as const;

function trackEvent(name: string) {
  try {
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === 'function') gtag('event', name);
  } catch {
    /* ignore */
  }
}

const GroundingWalkthrough: React.FC = () => {
  const [step, setStep] = useState(0);
  const [filled, setFilled] = useState<string[]>(['']);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  const current = STEPS[step];

  const start = () => {
    setStarted(true);
    setStep(0);
    setFilled(Array(STEPS[0].count).fill(''));
    setDone(false);
    trackEvent('tool_grounding_start');
  };

  const updateSlot = (i: number, value: string) => {
    setFilled((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  };

  const canAdvance = filled.every((v) => v.trim().length > 0) || filled.filter((v) => v.trim()).length >= Math.min(2, current.count);

  const next = () => {
    if (step >= STEPS.length - 1) {
      setDone(true);
      trackEvent('tool_grounding_complete');
      return;
    }
    const n = step + 1;
    setStep(n);
    setFilled(Array(STEPS[n].count).fill(''));
  };

  if (!started) {
    return (
      <div className="text-center space-y-5 py-6">
        <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          When anxiety spikes, this walkthrough pulls attention back to your senses — one step at a time. Takes about 2–5 minutes.
        </p>
        <button
          type="button"
          onClick={start}
          className="px-6 py-2.5 rounded-full bg-zinc-100 text-zinc-950 text-sm font-medium hover:bg-white"
        >
          Start grounding
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="font-display text-2xl text-zinc-100">You are here.</p>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto">
          Notice your breath for one more cycle. If you want more support, try a guided anxiety session.
        </p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <a href="/category/anxiety" className="px-4 py-2 rounded-full bg-zinc-100 text-zinc-950 text-xs font-semibold">
            Anxiety sessions
          </a>
          <button
            type="button"
            onClick={start}
            className="px-4 py-2 rounded-full border border-white/10 text-xs text-zinc-300"
          >
            Run again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          Step {step + 1} of {STEPS.length}
        </span>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full ${i <= step ? 'bg-indigo-400/80' : 'bg-white/10'}`}
            />
          ))}
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="font-display text-3xl text-zinc-100 tabular-nums">{current.count}</p>
        <h2 className="text-lg text-zinc-200 font-medium">{current.prompt}</h2>
        <p className="text-sm text-zinc-500">{current.hint}</p>
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        {filled.map((val, i) => (
          <input
            key={`${step}-${i}`}
            value={val}
            onChange={(e) => updateSlot(i, e.target.value)}
            placeholder={`${i + 1}.`}
            className="w-full rounded-xl bg-zinc-950/60 border border-white/10 px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/40"
          />
        ))}
      </div>

      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={next}
          disabled={!canAdvance}
          className="px-6 py-2.5 rounded-full bg-zinc-100 text-zinc-950 text-sm font-medium disabled:opacity-40"
        >
          {step >= STEPS.length - 1 ? 'Finish' : 'Next sense'}
        </button>
        <button
          type="button"
          onClick={next}
          className="px-4 py-2.5 rounded-full border border-white/10 text-xs text-zinc-400"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default GroundingWalkthrough;
