import React from 'react';

const SessionCardSkeleton: React.FC = () => {
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 animate-pulse">
      <div className="h-48 w-full rounded-xl bg-zinc-800 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
        <div className="h-3 bg-zinc-800 rounded w-full"></div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-zinc-800"></div>
          <div className="h-3 bg-zinc-800 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

export default SessionCardSkeleton;
