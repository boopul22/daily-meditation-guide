import React, { useState, useEffect } from 'react';
import { Session } from '../types';

interface PlayerBarProps {
  currentTrack: Session | null;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const PlayerBar: React.FC<PlayerBarProps> = ({ currentTrack, isPlaying, onPlayPause }) => {
  const [progress, setProgress] = useState(35);
  
  // Fake progress simulation
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 0.1));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 w-full z-40 border-t border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0a0a0a]/60 transition-all duration-500 fade-enter-active">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        
        {/* Track Info */}
        <div className="flex items-center gap-4 w-1/4">
          <div className="w-10 h-10 rounded-md bg-zinc-800 flex items-center justify-center relative overflow-hidden group">
            <div className={`absolute inset-0 bg-gradient-to-br from-${currentTrack.color}-500/20 to-purple-500/20`}></div>
            <iconify-icon icon="solar:music-note-linear" class="text-zinc-400 relative z-10"></iconify-icon>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-zinc-200 tracking-tight line-clamp-1">{currentTrack.title}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider line-clamp-1">{currentTrack.author}</p>
          </div>
        </div>

        {/* Controls & Progress */}
        <div className="flex flex-col items-center flex-1 max-w-md">
          <div className="flex items-center gap-6 mb-1">
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <iconify-icon icon="solar:shuffle-linear" width="18" stroke-width="1.5"></iconify-icon>
            </button>
            <button className="text-zinc-400 hover:text-zinc-100 transition-colors">
              <iconify-icon icon="solar:skip-previous-linear" width="20" stroke-width="1.5"></iconify-icon>
            </button>
            <button 
              onClick={onPlayPause}
              className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
            >
              <iconify-icon icon={isPlaying ? "solar:pause-linear" : "solar:play-linear"} width="18" stroke-width="1.5"></iconify-icon>
            </button>
            <button className="text-zinc-400 hover:text-zinc-100 transition-colors">
              <iconify-icon icon="solar:skip-next-linear" width="20" stroke-width="1.5"></iconify-icon>
            </button>
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <iconify-icon icon="solar:repeat-linear" width="18" stroke-width="1.5"></iconify-icon>
            </button>
          </div>
          <div className="w-full flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 tabular-nums">04:20</span>
            <input 
              type="range" 
              className="w-full h-1" 
              min="0" 
              max="100" 
              value={progress} 
              onChange={(e) => setProgress(Number(e.target.value))}
            />
            <span className="text-[10px] text-zinc-500 tabular-nums">{currentTrack.duration}</span>
          </div>
        </div>

        {/* Volume/Extra */}
        <div className="flex items-center justify-end gap-3 w-1/4">
          <button className="text-zinc-500 hover:text-zinc-300 hidden sm:block">
            <iconify-icon icon="solar:playlist-linear" width="20" stroke-width="1.5"></iconify-icon>
          </button>
          <div className="flex items-center gap-2 group cursor-pointer">
            <iconify-icon icon="solar:volume-small-linear" width="20" stroke-width="1.5" class="text-zinc-500"></iconify-icon>
            <div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-zinc-500 rounded-full group-hover:bg-zinc-300 transition-colors"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlayerBar;