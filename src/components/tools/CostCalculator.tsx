import React, { useMemo, useState } from 'react';

const PLANS = [
  { id: 'calm', name: 'Calm', monthly: 14.99 },
  { id: 'headspace', name: 'Headspace', monthly: 12.99 },
  { id: 'insight', name: 'Insight Timer Plus', monthly: 9.99 },
] as const;

const CostCalculator: React.FC = () => {
  const [planId, setPlanId] = useState<(typeof PLANS)[number]['id']>('calm');
  const [years, setYears] = useState(3);
  const plan = PLANS.find((p) => p.id === planId) || PLANS[0];

  const totals = useMemo(() => {
    const yearly = plan.monthly * 12;
    const total = yearly * years;
    return { yearly, total };
  }, [plan, years]);

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="flex flex-wrap gap-2 justify-center">
        {PLANS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlanId(p.id)}
            className={`px-3 py-1.5 rounded-full text-xs border ${
              planId === p.id ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200' : 'border-white/10 text-zinc-400'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <label className="flex items-center justify-center gap-2 text-sm text-zinc-400">
        Years
        <input
          type="range"
          min={1}
          max={10}
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          className="w-40"
        />
        <span className="text-zinc-200 tabular-nums w-6">{years}</span>
      </label>
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-950/50 p-5 text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-zinc-500">Estimated spend</p>
        <p className="font-display text-4xl text-zinc-100">${totals.total.toFixed(0)}</p>
        <p className="text-sm text-zinc-500">
          ${plan.monthly}/mo → ${totals.yearly.toFixed(0)}/year × {years} years
        </p>
      </div>
      <div className="text-sm text-zinc-400 space-y-2 leading-relaxed">
        <p>
          Free alternative on this site: breath timers, grounding, and guided sessions — no subscription required.
        </p>
        <div className="flex flex-wrap gap-2 justify-center pt-2">
          <a href="/tools" className="px-4 py-2 rounded-full bg-zinc-100 text-zinc-950 text-xs font-semibold">
            Try free tools
          </a>
          <a href="/sessions" className="px-4 py-2 rounded-full border border-white/10 text-xs text-zinc-300">
            Free session library
          </a>
        </div>
      </div>
    </div>
  );
};

export default CostCalculator;
