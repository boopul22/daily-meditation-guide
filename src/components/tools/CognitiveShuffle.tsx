import React, { useEffect, useRef, useState } from 'react';

const SEED = [
  'lamp', 'cloud', 'pebble', 'cedar', 'ribbon', 'harbor', 'linen', 'marble', 'willow', 'copper',
  'meadow', 'canvas', 'orchid', 'sparrow', 'glacier', 'amber', 'pottery', 'lantern', 'drizzle', 'quilt',
  'basin', 'fern', 'cobalt', 'walnut', 'sandal', 'ivory', 'moss', 'plaza', 'breeze', 'timber',
  'cipher', 'velvet', 'anvil', 'harbor', 'nectar', 'plaid', 'sierra', 'thistle', 'coral', 'ember',
];

function pickWords(n: number) {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    out.push(SEED[Math.floor(Math.random() * SEED.length)]);
  }
  return out;
}

const CognitiveShuffle: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [word, setWord] = useState('…');
  const [intervalMs, setIntervalMs] = useState(4000);
  const timer = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    const tick = () => setWord(pickWords(1)[0]);
    tick();
    timer.current = window.setInterval(tick, intervalMs);
    return () => clearInterval(timer.current);
  }, [running, intervalMs]);

  return (
    <div className="text-center space-y-6 py-4">
      <p className="text-sm text-zinc-500 max-w-md mx-auto">
        Softly picture each word as it appears. Do not force a story — let images come and go until sleep arrives.
      </p>
      <p className="font-display text-5xl md:text-6xl text-zinc-100 tracking-tight min-h-[4.5rem] capitalize">{word}</p>
      <div className="flex flex-wrap gap-3 justify-center items-center text-xs text-zinc-400">
        <label className="flex items-center gap-2">
          Pace
          <select
            value={intervalMs}
            disabled={running}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
            className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-zinc-200"
          >
            <option value={3000}>Slow (3s)</option>
            <option value={4000}>Gentle (4s)</option>
            <option value={6000}>Very slow (6s)</option>
          </select>
        </label>
      </div>
      <div className="flex gap-3 justify-center">
        {!running ? (
          <button
            type="button"
            onClick={() => setRunning(true)}
            className="px-6 py-2.5 rounded-full bg-zinc-100 text-zinc-950 text-sm font-medium"
          >
            Start
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setRunning(false)}
            className="px-6 py-2.5 rounded-full border border-white/15 text-sm text-zinc-200"
          >
            Pause
          </button>
        )}
      </div>
      <a href="/category/sleep" className="inline-block text-xs text-indigo-400 hover:text-indigo-300">
        Prefer a guided sleep session →
      </a>
    </div>
  );
};

export default CognitiveShuffle;
