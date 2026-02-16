import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#030303]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center bg-zinc-900 group-hover:border-zinc-500 transition-colors">
              <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
            </div>
            <span className="text-zinc-200 font-medium tracking-tighter text-sm">dailymeditationguide.com</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Practice</Link>
            <button className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Sounds</button>
            <button className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Journal</button>
            <button className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">About</button>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:block p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white">
              <iconify-icon icon="solar:magnifer-linear" width="20" stroke-width="1.5"></iconify-icon>
            </button>
            <button className="hidden md:block p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white relative">
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              <iconify-icon icon="solar:bell-linear" width="20" stroke-width="1.5"></iconify-icon>
            </button>
            <div className="hidden md:block w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-white/10"></div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-zinc-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <iconify-icon icon={isMobileMenuOpen ? "solar:close-linear" : "solar:hamburger-menu-linear"} width="24"></iconify-icon>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#030303] pt-24 px-6 md:hidden animate-[fade-enter_0.2s_ease-out]">
          <div className="flex flex-col gap-6 text-lg font-medium text-zinc-300">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/5 pb-4">Practice</Link>
            <button className="text-left border-b border-white/5 pb-4">Sounds</button>
            <button className="text-left border-b border-white/5 pb-4">Journal</button>
            <button className="text-left border-b border-white/5 pb-4">About</button>

            <div className="flex items-center gap-4 mt-4">
              <button className="p-3 bg-white/5 rounded-full text-zinc-400">
                <iconify-icon icon="solar:magnifer-linear" width="24"></iconify-icon>
              </button>
              <button className="p-3 bg-white/5 rounded-full text-zinc-400 relative">
                <div className="absolute top-3 right-3 w-2 h-2 bg-indigo-500 rounded-full"></div>
                <iconify-icon icon="solar:bell-linear" width="24"></iconify-icon>
              </button>
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-white/10"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
