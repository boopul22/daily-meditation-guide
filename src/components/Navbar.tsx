import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $user, $authLoading, login, logout, fetchCurrentUser } from '../stores/authStore';

type NotificationItem = {
  slug: string;
  title: string;
  category?: string;
  description?: string;
  author?: string;
  publishedAt: string | null;
};

const LAST_SEEN_KEY = 'dmg:notifications:lastSeen';

function formatRelative(iso: string | null): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [allSessions, setAllSessions] = useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifLoaded, setNotifLoaded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const notifications = allSessions.slice(0, 6);
  const searchResults = searchQuery.trim()
    ? allSessions
        .filter((s) => {
          const q = searchQuery.toLowerCase();
          return (
            s.title?.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q) ||
            s.category?.toLowerCase().includes(q) ||
            s.author?.toLowerCase().includes(q)
          );
        })
        .slice(0, 10)
    : [];
  const user = useStore($user);
  const loading = useStore($authLoading);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const loadSessions = async () => {
    if (notifLoading) return;
    setNotifLoading(true);
    try {
      const res = await fetch('/api/sessions');
      if (!res.ok) throw new Error('Failed');
      const data = (await res.json()) as NotificationItem[];
      setAllSessions(data);
      setNotifLoaded(true);
      const lastSeen = Number(localStorage.getItem(LAST_SEEN_KEY) || 0);
      const unread = data.slice(0, 6).filter(n => {
        const t = n.publishedAt ? new Date(n.publishedAt).getTime() : 0;
        return t > lastSeen;
      }).length;
      setUnreadCount(unread);
    } catch {
      setNotifLoaded(true);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const openNotifications = () => {
    setIsNotifOpen(true);
    if (!notifLoaded) loadSessions();
    const newest = notifications[0]?.publishedAt;
    if (newest) {
      localStorage.setItem(LAST_SEEN_KEY, String(new Date(newest).getTime()));
    } else {
      localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
    }
    setUnreadCount(0);
  };

  const toggleNotifications = () => {
    if (isNotifOpen) setIsNotifOpen(false);
    else openNotifications();
  };

  const openSearch = () => {
    setIsSearchOpen(true);
    if (!notifLoaded) loadSessions();
    setIsMobileMenuOpen(false);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isSearchOpen) closeSearch();
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openSearch();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isSearchOpen, notifLoaded]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.06] bg-[#080706]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center bg-zinc-900 group-hover:border-zinc-500 transition-colors">
              <div className="w-2 h-2 rounded-full bg-zinc-200"></div>
            </div>
            <span className="text-zinc-200 font-medium tracking-tighter text-sm">dailymeditationguide.com</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Practice</a>
            <a href="/sessions" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Sessions</a>
            <a href="/infographics" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Infographics</a>
            <a href="/about" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">About</a>
            <a href="/contact" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={openSearch} aria-label="Search" className="hidden md:block p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white">
              <iconify-icon icon="solar:magnifer-linear" width="20" stroke-width="1.5"></iconify-icon>
            </button>
            <div className="hidden md:block relative" ref={notifRef}>
              <button
                onClick={toggleNotifications}
                aria-label="Notifications"
                aria-haspopup="menu"
                aria-expanded={isNotifOpen}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white relative"
              >
                {unreadCount > 0 && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                )}
                <iconify-icon icon="solar:bell-linear" width="20" stroke-width="1.5"></iconify-icon>
              </button>
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 py-2 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-50">
                  <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                    <p className="text-sm text-zinc-200 font-medium">Latest sessions</p>
                    <a href="/sessions" className="text-xs text-indigo-400 hover:text-indigo-300">View all</a>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifLoading && notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-zinc-500">Loading…</div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-zinc-500">No new sessions</div>
                    ) : (
                      notifications.map((n) => (
                        <a
                          key={n.slug}
                          href={`/session/${n.slug}`}
                          onClick={() => setIsNotifOpen(false)}
                          className="block px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                        >
                          <p className="text-sm text-zinc-200 font-medium line-clamp-2">{n.title}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {n.category ? `${n.category} · ` : ''}{formatRelative(n.publishedAt)}
                          </p>
                        </a>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Auth */}
            {loading ? (
              <div className="hidden md:block w-8 h-8 rounded-full bg-zinc-800 animate-pulse"></div>
            ) : user ? (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-label="User menu"
                  aria-haspopup="menu"
                  aria-expanded={isDropdownOpen}
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
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <iconify-icon icon={isMobileMenuOpen ? "solar:close-linear" : "solar:hamburger-menu-linear"} width="24"></iconify-icon>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#080706] pt-24 px-6 md:hidden animate-[fade-enter_0.2s_ease-out]">
          <div className="flex flex-col gap-6 text-lg font-medium text-zinc-300">
            <a href="/" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/5 pb-4">Practice</a>
            <a href="/sessions" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/5 pb-4">Sessions</a>
            <a href="/infographics" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/5 pb-4">Infographics</a>
            <a href="/about" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/5 pb-4">About</a>
            <a href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/5 pb-4">Contact</a>

            <div className="flex items-center gap-4 mt-4">
              <button onClick={openSearch} aria-label="Search" className="p-3 bg-white/5 rounded-full text-zinc-400">
                <iconify-icon icon="solar:magnifer-linear" width="24"></iconify-icon>
              </button>
              <button
                onClick={toggleNotifications}
                aria-label="Notifications"
                aria-expanded={isNotifOpen}
                className="p-3 bg-white/5 rounded-full text-zinc-400 relative"
              >
                {unreadCount > 0 && (
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full"></div>
                )}
                <iconify-icon icon="solar:bell-linear" width="24"></iconify-icon>
              </button>
            </div>
            {isNotifOpen && (
              <div className="mt-2 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <p className="text-sm text-zinc-200 font-medium">Latest sessions</p>
                  <a href="/sessions" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-indigo-400">View all</a>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifLoading && notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-zinc-500">Loading…</div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-zinc-500">No new sessions</div>
                  ) : (
                    notifications.map((n) => (
                      <a
                        key={n.slug}
                        href={`/session/${n.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-b-0"
                      >
                        <p className="text-sm text-zinc-200 font-medium line-clamp-2">{n.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {n.category ? `${n.category} · ` : ''}{formatRelative(n.publishedAt)}
                        </p>
                      </a>
                    ))
                  )}
                </div>
              </div>
            )}

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

      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          onClick={closeSearch}
        >
          <div
            className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <iconify-icon icon="solar:magnifer-linear" width="20" class="text-zinc-500"></iconify-icon>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search meditations…"
                className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 outline-none text-sm"
              />
              <button
                onClick={closeSearch}
                aria-label="Close search"
                className="text-zinc-500 hover:text-zinc-300 text-xs px-2 py-1 border border-white/10 rounded"
              >
                Esc
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {notifLoading && allSessions.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-zinc-500">Loading sessions…</div>
              ) : !searchQuery.trim() ? (
                <div className="px-4 py-8 text-center text-sm text-zinc-500">Start typing to search {allSessions.length} sessions</div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-zinc-500">No matches for "{searchQuery}"</div>
              ) : (
                searchResults.map((s) => (
                  <a
                    key={s.slug}
                    href={`/session/${s.slug}`}
                    onClick={closeSearch}
                    className="block px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-b-0"
                  >
                    <p className="text-sm text-zinc-100 font-medium line-clamp-1">{s.title}</p>
                    {s.description && (
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{s.description}</p>
                    )}
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {s.category}{s.author ? ` · ${s.author}` : ''}
                    </p>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
