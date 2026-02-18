import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, loading, login, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <Link to="/sessions" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Sessions</Link>
            <Link to="/about" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:block p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white">
              <iconify-icon icon="solar:magnifer-linear" width="20" stroke-width="1.5"></iconify-icon>
            </button>
            <button className="hidden md:block p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white relative">
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              <iconify-icon icon="solar:bell-linear" width="20" stroke-width="1.5"></iconify-icon>
            </button>

            {/* Desktop Auth */}
            {loading ? (
              <div className="hidden md:block w-8 h-8 rounded-full bg-zinc-800 animate-pulse"></div>
            ) : user ? (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border border-white/10 flex items-center justify-center text-white text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 py-2 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-50">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-sm text-zinc-200 font-medium truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={login}
                className="hidden md:block px-4 py-1.5 text-sm font-medium text-zinc-300 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-full transition-colors"
              >
                Sign In
              </button>
            )}

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
            <Link to="/sessions" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/5 pb-4">Sessions</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/5 pb-4">About</Link>

            <div className="flex items-center gap-4 mt-4">
              <button className="p-3 bg-white/5 rounded-full text-zinc-400">
                <iconify-icon icon="solar:magnifer-linear" width="24"></iconify-icon>
              </button>
              <button className="p-3 bg-white/5 rounded-full text-zinc-400 relative">
                <div className="absolute top-3 right-3 w-2 h-2 bg-indigo-500 rounded-full"></div>
                <iconify-icon icon="solar:bell-linear" width="24"></iconify-icon>
              </button>
            </div>

            {/* Mobile Auth */}
            <div className="mt-2 border-t border-white/5 pt-6">
              {loading ? (
                <div className="w-12 h-12 rounded-full bg-zinc-800 animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border border-white/10 flex items-center justify-center text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-zinc-200 font-medium">{user.name}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    login();
                  }}
                  className="w-full py-3 text-center text-zinc-200 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Sign In with Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
