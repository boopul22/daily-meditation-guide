import React, { useMemo, useState } from 'react';

type SessionCard = {
  slug: string;
  title: string;
  category: string;
  duration?: string;
  durationSec?: number;
  description?: string;
};

type Props = {
  sessions: SessionCard[];
};

const GOALS = [
  { id: 'sleep', label: 'Sleep' },
  { id: 'anxiety', label: 'Anxiety' },
  { id: 'focus', label: 'Focus' },
  { id: 'breath', label: 'Breathwork' },
  { id: 'any', label: 'Anything' },
] as const;

const DURATIONS = [
  { id: 5, label: '≤ 5 min' },
  { id: 10, label: '≤ 10 min' },
  { id: 20, label: '≤ 20 min' },
  { id: 60, label: 'Any length' },
] as const;

function parseMinutes(s: SessionCard): number {
  if (typeof s.durationSec === 'number' && s.durationSec > 0) return Math.round(s.durationSec / 60);
  const m = (s.duration || '').match(/(\d+)/);
  return m ? Number(m[1]) : 10;
}

const SessionFinder: React.FC<Props> = ({ sessions }) => {
  const [goal, setGoal] = useState<(typeof GOALS)[number]['id']>('any');
  const [maxMin, setMaxMin] = useState(10);

  const matches = useMemo(() => {
    const g = goal.toLowerCase();
    return sessions
      .filter((s) => {
        const mins = parseMinutes(s);
        if (mins > maxMin) return false;
        if (goal === 'any') return true;
        const blob = `${s.category} ${s.title} ${s.description || ''}`.toLowerCase();
        if (goal === 'breath') return /breath|pranayama/.test(blob);
        return blob.includes(g);
      })
      .slice(0, 6);
  }, [sessions, goal, maxMin]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-center">
        {GOALS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGoal(g.id)}
            className={`px-3 py-1.5 rounded-full text-xs border ${
              goal === g.id ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200' : 'border-white/10 text-zinc-400'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {DURATIONS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setMaxMin(d.id)}
            className={`px-3 py-1.5 rounded-full text-xs border ${
              maxMin === d.id ? 'bg-zinc-100 text-zinc-950 border-transparent' : 'border-white/10 text-zinc-400'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {matches.length === 0 && (
          <p className="text-sm text-zinc-500 col-span-full text-center py-6">
            No exact matches — try a longer duration or{' '}
            <a href="/sessions" className="text-indigo-400">
              browse the library
            </a>
            .
          </p>
        )}
        {matches.map((s) => (
          <a
            key={s.slug}
            href={`/session/${s.slug}`}
            className="rounded-2xl border border-white/[0.06] bg-zinc-950/40 p-4 hover:border-white/15 transition-colors"
          >
            <p className="text-sm text-zinc-100 font-medium line-clamp-2">{s.title}</p>
            <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-wide">
              {s.duration || `${parseMinutes(s)} min`} · {s.category}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SessionFinder;
