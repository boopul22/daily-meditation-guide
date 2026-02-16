import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Session } from '../types';
import { fetchSessionBySlug, fetchSessions } from '../lib/api';

interface DetailViewProps {
  onPlay: (session: Session) => void;
  currentTrackId?: string;
  isPlaying: boolean;
}

const DetailView: React.FC<DetailViewProps> = ({ onPlay, currentTrackId, isPlaying }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [session, setSession] = useState<Session | null>(null);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError('');

    Promise.all([fetchSessionBySlug(slug), fetchSessions()])
      .then(([s, all]) => {
        setSession(s);
        setAllSessions(all);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 py-8">
        <div className="h-4 bg-zinc-800 rounded w-32"></div>
        <div className="h-10 bg-zinc-800 rounded w-3/4"></div>
        <div className="h-64 bg-zinc-800 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-medium text-zinc-200">
          {error ? 'Error loading session' : 'Session not found'}
        </h2>
        <p className="text-zinc-500">{error || "The session you're looking for doesn't exist."}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 bg-zinc-100 text-zinc-900 rounded-full text-sm font-medium hover:bg-white transition-colors"
        >
          Back to Sessions
        </button>
      </div>
    );
  }

  const bgGradients: Record<string, string> = {
    indigo: 'from-indigo-900/50',
    teal: 'from-teal-900/50',
    orange: 'from-orange-900/50',
    rose: 'from-rose-900/50',
    blue: 'from-blue-900/50',
    emerald: 'from-emerald-900/50',
  };

  const gradientClass = bgGradients[session.color] || 'from-zinc-900/50';
  const related = allSessions.filter(s => session.relatedSessions.includes(s.id));
  const isCurrent = currentTrackId === session.id;

  return (
    <div ref={containerRef} className="animate-[fade-enter_0.5s_ease-out]">
      {/* Back Button */}
      <button onClick={() => navigate('/')} className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-200 mb-8 transition-colors">
        <iconify-icon icon="solar:arrow-left-linear" class="group-hover:-translate-x-1 transition-transform"></iconify-icon>
        <span className="text-sm font-medium">Back to Sessions</span>
      </button>

      <article className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Left: Content */}
        <div className="lg:col-span-7 space-y-8">
          <header className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] font-medium uppercase tracking-widest">
                {session.category}
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                <iconify-icon icon="solar:clock-circle-linear" width="14"></iconify-icon>
                <span>{session.duration}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-medium text-zinc-100 tracking-tight leading-tight">
              {session.title}
            </h1>

            <div className="flex items-center gap-4 border-b border-white/5 pb-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-white/10"></div>
              <div>
                <p className="text-sm text-zinc-200 font-medium">{session.author}</p>
                <p className="text-xs text-zinc-500">{session.role}</p>
              </div>
              <div className="flex-grow"></div>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
                  <iconify-icon icon="solar:bookmark-linear" width="16"></iconify-icon>
                </button>
                <button className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
                  <iconify-icon icon="solar:share-linear" width="16"></iconify-icon>
                </button>
              </div>
            </div>
          </header>

          {/* Blog Body - injected HTML from API */}
          <div
            className="prose prose-invert prose-zinc max-w-none text-zinc-400 font-light leading-relaxed"
            dangerouslySetInnerHTML={{ __html: session.fullContent }}
          />
        </div>

        {/* Right: Sticky Player/Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            {/* Visual Player Card */}
            <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl shadow-black/50">
              <div className={`h-64 bg-gradient-to-br ${gradientClass} to-zinc-900 relative transition-colors duration-500`}>
                {session.featuredImage ? (
                  <img src={session.featuredImage} alt={session.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40"></div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => onPlay(session)}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                  >
                    <iconify-icon icon={isCurrent && isPlaying ? "solar:pause-linear" : "solar:play-linear"} width="28" stroke-width="2" class="ml-1"></iconify-icon>
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-xs font-medium text-zinc-500 uppercase tracking-widest">
                  <span>{isCurrent && isPlaying ? "Now Playing" : "Up Next"}</span>
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`}></span>
                    {isCurrent ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-zinc-100 tracking-tight">{session.title}</h3>
                  <p className="text-zinc-500 text-sm mt-1">Guided Audio Session</p>
                </div>

                {/* Waveform visual */}
                <div className={`flex items-center gap-1 h-8 items-end justify-center my-2 ${isCurrent && isPlaying ? 'opacity-100' : 'opacity-30'}`}>
                  {[3, 5, 8, 4, 6, 3, 7, 4, 2, 5, 3, 5, 8, 4, 6].map((h, i) => (
                     <div
                       key={i}
                       className={`w-1 bg-zinc-500 rounded-full ${isCurrent && isPlaying ? 'animate-pulse' : ''}`}
                       style={{ height: `${h * 4}px`, animationDelay: `${i * 0.05}s` }}
                     ></div>
                  ))}
                </div>

                <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-200 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <iconify-icon icon="solar:download-linear" width="18"></iconify-icon>
                  Download for Offline
                </button>
              </div>
            </div>

            <div className="rounded-xl p-5 border border-white/5 bg-zinc-900/30">
              <h4 className="text-zinc-200 font-medium text-sm mb-3">Related Sessions</h4>
              <div className="space-y-3">
                {related.map(r => (
                  <Link key={r.id} to={`/session/${r.slug}`} className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <iconify-icon icon="solar:play-linear" class="text-zinc-500 group-hover:text-zinc-300"></iconify-icon>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-300 group-hover:text-white transition-colors">{r.title}</p>
                      <p className="text-[10px] text-zinc-500">{r.duration} • {r.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </article>
    </div>
  );
};

export default DetailView;
