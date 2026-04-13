import { useState } from 'react';
import { FILTERS } from '../constants';
import type { Session } from '../types';
import SessionCard from './SessionCard';

interface HomeVideo {
  id: string;
  title: string;
  slug: string;
}

interface HomeContentProps {
  sessions: Session[];
  videos?: HomeVideo[];
}

type Mode = 'audio' | 'video';

export default function HomeContent({ sessions, videos = [] }: HomeContentProps) {
  const [mode, setMode] = useState<Mode>('audio');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredSessions = activeFilter === 'All'
    ? sessions
    : sessions.filter(s => s.category === activeFilter || (activeFilter === 'Nature Sounds' && s.category === 'Sounds'));

  return (
    <div className="space-y-20">
      {/* Primary mode toggle: Audio vs Video */}
      <section>
        <div role="tablist" aria-label="Session type" className="inline-flex p-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
          <button
            role="tab"
            aria-selected={mode === 'audio'}
            onClick={() => setMode('audio')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'audio'
                ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <iconify-icon icon="solar:headphones-round-linear" width="18"></iconify-icon>
              Audio Sessions
            </span>
          </button>
          <button
            role="tab"
            aria-selected={mode === 'video'}
            onClick={() => setMode('video')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              mode === 'video'
                ? 'bg-zinc-100 text-zinc-900 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <iconify-icon icon="solar:videocamera-linear" width="18"></iconify-icon>
              Video Sessions
            </span>
          </button>
        </div>
      </section>

      {mode === 'audio' ? (
        <>
          {/* Audio category filters */}
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

          {/* Audio sessions grid */}
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
        </>
      ) : (
        <section>
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-display text-2xl font-medium text-zinc-200 tracking-tight">Recent Videos</h2>
            <a href="/video-sessions" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
              View all <iconify-icon icon="solar:arrow-right-linear"></iconify-icon>
            </a>
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-500">No video sessions yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={`/video-sessions/${video.slug}`}
                  className="group block bg-zinc-900/40 border border-white/[0.06] hover:border-white/[0.12] rounded-2xl overflow-hidden transition-all duration-300 hover:bg-zinc-800/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                      alt={video.title}
                      loading="lazy"
                      decoding="async"
                      width={480}
                      height={360}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20">
                        <iconify-icon icon="solar:play-linear" width="28" className="ml-1"></iconify-icon>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-zinc-100 font-medium tracking-tight line-clamp-2 group-hover:text-white transition-colors">
                      {video.title}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
