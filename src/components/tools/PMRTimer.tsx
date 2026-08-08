import React, { useEffect, useState } from 'react';

const PARTS = [
  'Feet and toes',
  'Calves and shins',
  'Thighs',
  'Hips and lower belly',
  'Chest and upper back',
  'Hands and forearms',
  'Shoulders and neck',
  'Jaw and face',
  'Whole body soft',
];

const PMRTimer: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'tense' | 'release'>('tense');
  const [left, setLeft] = useState(5);
  const tenseSec = 5;
  const releaseSec = 10;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setLeft((t) => {
        if (t > 1) return t - 1;
        if (phase === 'tense') {
          setPhase('release');
          return releaseSec;
        }
        if (index >= PARTS.length - 1) {
          setRunning(false);
          return 0;
        }
        setIndex((i) => i + 1);
        setPhase('tense');
        return tenseSec;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, phase, index]);

  const start = () => {
    setIndex(0);
    setPhase('tense');
    setLeft(tenseSec);
    setRunning(true);
  };

  const done = !running && index >= PARTS.length - 1 && left === 0;

  return (
    <div className="text-center space-y-5 py-4">
      <p className="text-sm text-zinc-500 max-w-md mx-auto">
        Gently tense each area, then release. Skip any area that hurts.
      </p>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          {index + 1} / {PARTS.length} · {phase === 'tense' ? 'Tense' : 'Release'}
        </p>
        <h2 className="font-display text-3xl text-zinc-100">{PARTS[index]}</h2>
        <p className="font-display text-5xl text-indigo-300/90 tabular-nums">{left || '—'}</p>
      </div>
      <div className="flex gap-3 justify-center">
        {!running && !done && (
          <button type="button" onClick={start} className="px-6 py-2.5 rounded-full bg-zinc-100 text-zinc-950 text-sm font-medium">
            Start PMR
          </button>
        )}
        {running && (
          <button
            type="button"
            onClick={() => setRunning(false)}
            className="px-6 py-2.5 rounded-full border border-white/15 text-sm text-zinc-200"
          >
            Pause
          </button>
        )}
        {done && (
          <a href="/category/sleep" className="px-6 py-2.5 rounded-full bg-zinc-100 text-zinc-950 text-sm font-medium">
            Sleep sessions
          </a>
        )}
      </div>
    </div>
  );
};

export default PMRTimer;
