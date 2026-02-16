import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030303]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center bg-zinc-900 group-hover:border-zinc-500 transition-colors">
            <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
          </div>
          <span className="text-zinc-200 font-medium tracking-tighter text-sm">breathe.</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Practice</Link>
          <button className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Sounds</button>
          <button className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Journal</button>
          <button className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">About</button>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white">
            <iconify-icon icon="solar:magnifer-linear" width="20" stroke-width="1.5"></iconify-icon>
          </button>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white relative">
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
            <iconify-icon icon="solar:bell-linear" width="20" stroke-width="1.5"></iconify-icon>
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-white/10"></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
