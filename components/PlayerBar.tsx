import React from 'react';
import { Session } from '../types';

interface PlayerBarProps {
  currentTrack: Session | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const PlayerBar: React.FC<PlayerBarProps> = ({ currentTrack, isPlaying, onPlayPause, currentTime, duration, onSeek }) => {
  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 w-full z-40 border-t border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0a0a0a]/60 transition-all duration-500 fade-enter-active pb-safe">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4 md:gap-6">

        {/* Track Info */}
        <div className="flex items-center gap-3 md:gap-4 w-1/3 md:w-1/4 shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-md bg-zinc-800 flex items-center justify-center relative overflow-hidden group shrink-0">
            {currentTrack.featuredImage ? (
              <img src={currentTrack.featuredImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <div className={`absolute inset-0 bg-gradient-to-br from-${currentTrack.color}-500/20 to-purple-500/20`}></div>
                <iconify-icon icon="solar:music-note-linear" class="text-zinc-400 relative z-10"></iconify-icon>
              </>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-200 tracking-tight line-clamp-1">{currentTrack.title}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider line-clamp-1">{currentTrack.author}</p>
          </div>
        </div>

        {/* Controls & Progress */}
        <div className="flex flex-col items-center flex-1 max-w-md">
          <div className="flex items-center gap-4 md:gap-6 mb-1">
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors hidden sm:block">
              <iconify-icon icon="solar:shuffle-linear" width="18" stroke-width="1.5"></iconify-icon>
            </button>
            <button className="text-zinc-400 hover:text-zinc-100 transition-colors">
              <iconify-icon icon="solar:skip-previous-linear" width="20" stroke-width="1.5"></iconify-icon>
            </button>
            <button
              onClick={onPlayPause}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/10"
            >
              <iconify-icon icon={isPlaying ? "solar:pause-linear" : "solar:play-linear"} width="20" stroke-width="1.5"></iconify-icon>
            </button>
            <button className="text-zinc-400 hover:text-zinc-100 transition-colors">
              <iconify-icon icon="solar:skip-next-linear" width="20" stroke-width="1.5"></iconify-icon>
            </button>
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors hidden sm:block">
              <iconify-icon icon="solar:repeat-linear" width="18" stroke-width="1.5"></iconify-icon>
            </button>
          </div>
          <div className="w-full flex items-center gap-2 px-2 md:px-0">
            <span className="text-[10px] text-zinc-500 tabular-nums w-8 text-right hidden sm:block">{formatTime(currentTime)}</span>
            <input
              type="range"
              className="w-full h-1 accent-indigo-500"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => {
                const pct = Number(e.target.value);
                if (duration > 0) onSeek((pct / 100) * duration);
              }}
            />
            <span className="text-[10px] text-zinc-500 tabular-nums w-8 hidden sm:block">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume/Extra */}
        <div className="flex items-center justify-end gap-3 w-1/3 md:w-1/4 hidden sm:flex">
          <button className="text-zinc-500 hover:text-zinc-300">
            <iconify-icon icon="solar:playlist-linear" width="20" stroke-width="1.5"></iconify-icon>
          </button>
          <div className="flex items-center gap-2 group cursor-pointer">
            <iconify-icon icon="solar:volume-small-linear" width="20" stroke-width="1.5" class="text-zinc-500"></iconify-icon>
            <div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-zinc-500 rounded-full group-hover:bg-zinc-300 transition-colors"></div>
            </div>
          </div>
        </div>

        {/* Mobile Volume/Menu Toggle Placeholder if needed */}
        <div className="sm:hidden w-10 flex justify-end">
          <button className="text-zinc-500 hover:text-zinc-300">
            <iconify-icon icon="solar:menu-dots-linear" width="24" stroke-width="1.5"></iconify-icon>
          </button>
        </div>

      </div>
    </div>
  );
};

export default PlayerBar;
