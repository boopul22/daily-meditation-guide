import React from 'react';
import { Link } from 'react-router-dom';
import { Session } from '../types';

interface SessionCardProps {
  session: Session;
}

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  // Map simple color names to Tailwind classes explicitly for safelisting/JIT
  const colorMap: Record<string, string> = {
    indigo: 'from-indigo-900/40 group-hover:text-indigo-300',
    teal: 'from-teal-900/40 group-hover:text-teal-300',
    orange: 'from-orange-900/40 group-hover:text-orange-300',
    rose: 'from-rose-900/40 group-hover:text-rose-300',
    blue: 'from-blue-900/40 group-hover:text-blue-300',
    emerald: 'from-emerald-900/40 group-hover:text-emerald-300',
  };

  const gradientClass = colorMap[session.color].split(' ')[0];
  const textClass = colorMap[session.color].split(' ')[1];

  return (
    <Link
      to={`/session/${session.slug}`}
      className="cursor-pointer group relative bg-zinc-900/40 border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all duration-300 hover:bg-zinc-800/40"
    >
      <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4 bg-zinc-800">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} to-black/80`}></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:scale-110 transition-transform">
            <iconify-icon icon="solar:play-linear" width="24" class="ml-1"></iconify-icon>
          </div>
        </div>
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] font-medium text-white border border-white/10">
          {session.duration}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className={`text-zinc-200 font-medium tracking-tight ${textClass} transition-colors`}>
          {session.title}
        </h3>
        <p className="text-xs text-zinc-500 line-clamp-2">
          {session.description}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-zinc-700"></div>
          <span className="text-xs text-zinc-400">{session.author}</span>
        </div>
        <iconify-icon icon="solar:arrow-right-linear" class="text-zinc-600 group-hover:text-zinc-300 transition-colors"></iconify-icon>
      </div>
    </Link>
  );
};

export default SessionCard;
