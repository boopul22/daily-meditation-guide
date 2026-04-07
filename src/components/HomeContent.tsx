import { useState } from 'react';
import { FILTERS } from '../constants';
import type { Session } from '../types';
import SessionCard from './SessionCard';

interface HomeContentProps {
  sessions: Session[];
}

export default function HomeContent({ sessions }: HomeContentProps) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredSessions = activeFilter === 'All'
    ? sessions
    : sessions.filter(s => s.category === activeFilter || (activeFilter === 'Nature Sounds' && s.category === 'Sounds'));

  return (
    <div className="space-y-20">
      {/* Filters / Pills */}
      <section>
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 mask-linear">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilter === filter
                ? 'bg-zinc-100 text-zinc-900'
                : 'border border-white/10 hover:border-white/20 hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Grid Content */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <h2 className="font-display text-2xl font-medium text-zinc-200 tracking-tight">Recent Sessions</h2>
          <a href="/sessions" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
            View all <iconify-icon icon="solar:arrow-right-linear"></iconify-icon>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {filteredSessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>

        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500">No sessions found for this category.</p>
          </div>
        )}
      </section>
    </div>
  );
}
