import React, { useEffect, useMemo, useState } from 'react';

const KEY = 'dmg:streak:days';

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadDays(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function calcStreak(days: string[]): number {
  if (!days.length) return 0;
  const set = new Set(days);
  let streak = 0;
  const cur = new Date();
  for (;;) {
    const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
    if (!set.has(key)) break;
    streak += 1;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

const StreakLite: React.FC = () => {
  const [days, setDays] = useState<string[]>([]);
  const today = todayKey();
  const marked = days.includes(today);
  const streak = useMemo(() => calcStreak(days), [days]);

  useEffect(() => {
    setDays(loadDays());
  }, []);

  const toggleToday = () => {
    const next = marked ? days.filter((d) => d !== today) : [...days, today];
    setDays(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  return (
    <div className="text-center space-y-5 py-4">
      <p className="text-sm text-zinc-500">Private streak stored only in this browser. No account.</p>
      <p className="font-display text-6xl text-zinc-100 tabular-nums">{streak}</p>
      <p className="text-xs uppercase tracking-widest text-zinc-500">day streak</p>
      <button
        type="button"
        onClick={toggleToday}
        className={`px-6 py-2.5 rounded-full text-sm font-medium ${
          marked ? 'border border-teal-500/40 text-teal-300' : 'bg-zinc-100 text-zinc-950'
        }`}
      >
        {marked ? 'Today marked · undo' : 'I practiced today'}
      </button>
      <p className="text-xs text-zinc-600">{days.length} total days logged</p>
      <a href="/tools" className="inline-block text-xs text-indigo-400">
        Practice with a free tool →
      </a>
    </div>
  );
};

export default StreakLite;
