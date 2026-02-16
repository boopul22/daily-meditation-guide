import React, { useState, useEffect } from 'react';
import { FILTERS } from '../constants';
import { fetchSessions } from '../lib/api';
import { Session } from '../types';
import SessionCard from '../components/SessionCard';
import SessionCardSkeleton from '../components/SessionCardSkeleton';
import SEO from '../components/SEO';

const HomeView: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions()
      .then(setSessions)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredSessions = activeFilter === 'All'
    ? sessions
    : sessions.filter(s => s.category === activeFilter || (activeFilter === 'Nature Sounds' && s.category === 'Sounds'));

  return (
    <div className="space-y-20 transition-all duration-500 ease-in-out animate-[fade-enter_0.5s_ease-out]">
      <SEO />

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            NEW SESSION ADDED
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium text-zinc-100 tracking-tight leading-[1.1]">
            Find stillness in <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">the noise.</span>
          </h1>
          <p className="text-lg text-zinc-500 font-light max-w-md leading-relaxed">
            Curated audio journeys to help you focus, sleep, and reset. Start your daily practice with just five minutes.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <button className="group flex items-center gap-3 px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded-full font-medium text-sm transition-all hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
              <iconify-icon icon="solar:play-circle-linear" width="20" stroke-width="1.5" class="text-zinc-950"></iconify-icon>
              Start Daily Calm
            </button>
            <button className="px-6 py-3 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-full text-zinc-300 text-sm font-medium transition-all">
              Explore Library
            </button>
          </div>
        </div>

        {/* Abstract Visual */}
        <div className="relative w-full h-[400px] lg:h-[500px] rounded-3xl overflow-hidden border border-white/5 bg-zinc-900/50 flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-breathe"></div>
          <div className="absolute w-48 h-48 bg-teal-500/10 rounded-full blur-[60px] top-1/3 right-1/4 animate-breathe" style={{ animationDelay: '2s' }}></div>

          <div className="relative z-10 text-center space-y-2 backdrop-blur-sm p-8 rounded-2xl border border-white/5 bg-black/20">
            <iconify-icon icon="solar:meditation-round-linear" width="48" class="text-zinc-200 mb-2"></iconify-icon>
            <p className="text-zinc-200 font-medium tracking-tight">Afternoon Reset</p>
            <p className="text-zinc-500 text-xs uppercase tracking-widest">15 Min • Focus</p>
          </div>
        </div>
      </section>

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
          <h2 className="text-xl font-medium text-zinc-200 tracking-tight">Recent Sessions</h2>
          <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
            View all <iconify-icon icon="solar:arrow-right-linear"></iconify-icon>
          </a>
        </div>

        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-2">Failed to load sessions</p>
            <p className="text-zinc-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SessionCardSkeleton key={i} />)
            : filteredSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))
          }
        </div>
      </section>
    </div>
  );
};

export default HomeView;
