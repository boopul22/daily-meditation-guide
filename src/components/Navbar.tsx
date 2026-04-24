import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $user, $authLoading, login, logout, fetchCurrentUser } from '../stores/authStore';
import { ALL_CATEGORIES } from '../lib/videoCategories';
import { optimizedImage } from '../lib/image';

const NAV_CATEGORIES = ALL_CATEGORIES.map((c) => ({
  key: c.key,
  label: c.label,
  tagline: c.tagline,
  accent: c.accent,
}));

type NotificationItem = {
  slug: string;
  title: string;
  category?: string;
  description?: string;
  author?: string;
  featuredImage?: string;
  duration?: string;
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
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [allSessions, setAllSessions] = useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifLoaded, setNotifLoaded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
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
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const schedule = win.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    const cancel = win.cancelIdleCallback ?? window.clearTimeout;
    const id = schedule(() => loadSessions(), { timeout: 3000 });
    return () => cancel(id);
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
      if (categoriesRef.current && !categoriesRef.current.contains(target)) {
        setIsCategoriesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.06] bg-[#080706]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4 lg:grid lg:grid-cols-[auto_1fr_auto]">
          <a
            href="/"
            aria-label="Daily Meditation Guide — home"
            className="flex items-center gap-2.5 group cursor-pointer flex-shrink-0"
          >
            <img
              src="/favicon-32x32.png"
              alt=""
              aria-hidden="true"
              width={28}
              height={28}
              className="w-7 h-7 rounded-full ring-1 ring-zinc-700 group-hover:ring-zinc-500 transition-colors"
            />
            <span className="text-zinc-100 font-semibold tracking-tight text-[15px] hidden sm:inline">Daily Meditation Guide</span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center justify-center gap-7">
            <a href="/" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Practice</a>
            <a href="/sessions" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Sessions</a>

            <div className="relative" ref={categoriesRef}>
              <button
                type="button"
                onClick={() => setIsCategoriesOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isCategoriesOpen}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  isCategoriesOpen ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                Categories
                <iconify-icon
                  icon="solar:alt-arrow-down-linear"
                  width="14"
                  class={`transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`}
                ></iconify-icon>
              </button>

              {isCategoriesOpen && (
                <div
                  role="menu"
                  className="absolute left-1/2 -translate-x-1/2 mt-4 w-[34rem] bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-[fade-enter_0.15s_ease-out]"
                >
                  <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <iconify-icon icon="solar:widget-4-linear" width="16" class="text-zinc-400"></iconify-icon>
                      <p className="text-[13px] text-zinc-100 font-semibold tracking-tight">Browse by theme</p>
                    </div>
                    <a
                      href="/categories"
                      onClick={() => setIsCategoriesOpen(false)}
                      className="text-[11px] text-zinc-400 hover:text-white font-medium"
                    >
                      All categories →
                    </a>
                  </div>
                  <div className="grid grid-cols-2 p-2">
                    {NAV_CATEGORIES.map((c) => (
                      <a
                        key={c.key}
                        href={`/category/${c.key}`}
                        onClick={() => setIsCategoriesOpen(false)}
                        role="menuitem"
                        className="group flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
                      >
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 transition-transform group-hover:scale-[1.8]"
                          style={{ backgroundColor: c.accent, boxShadow: `0 0 12px ${c.accent}66` }}
                        ></span>
                        <div className="min-w-0">
                          <p className="text-sm text-zinc-100 font-medium tracking-tight group-hover:text-white leading-tight">
                            {c.label}
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{c.tagline}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <a href="/infographics" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Infographics</a>
            <a href="/about" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">About</a>
            <a href="/contact" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <a
              href="https://ko-fi.com/bipul"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 rounded-full transition-colors shadow-sm shadow-pink-500/20"
            >
              <iconify-icon icon="solar:heart-bold" width="14"></iconify-icon>
              Donate
            </a>
            <button onClick={openSearch} aria-label="Search" className="hidden lg:block p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white">
              <iconify-icon icon="solar:magnifer-linear" width="20" stroke-width="1.5"></iconify-icon>
            </button>
            <div className="hidden lg:block relative" ref={notifRef}>
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
                <div className="absolute right-0 mt-3 w-[22rem] bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-[fade-enter_0.15s_ease-out]">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <iconify-icon icon="solar:bell-bold" width="16" class="text-indigo-400"></iconify-icon>
                      <p className="text-sm text-zinc-100 font-semibold tracking-tight">Latest sessions</p>
                    </div>
                    <a href="/sessions" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">View all →</a>
                  </div>
                  <div className="max-h-[28rem] overflow-y-auto">
                    {notifLoading && notifications.length === 0 ? (
                      <div className="px-4 py-10 text-center text-sm text-zinc-500">Loading…</div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-10 text-center text-sm text-zinc-500">No new sessions</div>
                    ) : (
                      notifications.map((n) => (
                        <a
                          key={n.slug}
                          href={`/session/${n.slug}`}
                          onClick={() => setIsNotifOpen(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors border-b border-white/5 last:border-b-0 group"
                        >
                          {n.featuredImage ? (
                            <img
                              src={optimizedImage(n.featuredImage, { width: 96, height: 96, fit: 'cover' })}
                              alt=""
                              loading="lazy"
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-lg object-cover border border-white/5 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center flex-shrink-0">
                              <iconify-icon icon="solar:meditation-linear" width="20" class="text-indigo-300"></iconify-icon>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-100 font-medium line-clamp-2 group-hover:text-white leading-snug">{n.title}</p>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
                              {n.category && (
                                <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">{n.category}</span>
                              )}
                              <span>·</span>
                              <span>{formatRelative(n.publishedAt)}</span>
                            </div>
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Auth — fixed width slot prevents layout shift between loading → signed-in/out */}
            <div className={`hidden lg:flex items-center justify-end h-8 ml-1 ${user ? '' : 'min-w-[90px]'}`}>
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse"></div>
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
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
                className="px-4 py-1.5 text-sm font-medium text-zinc-300 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-full transition-colors"
              >
                Sign In
              </button>
            )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-zinc-400 hover:text-white"
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
        <div className="fixed inset-0 z-40 bg-[#080706] pt-24 px-6 lg:hidden animate-[fade-enter_0.2s_ease-out]">
          <div className="flex flex-col gap-6 text-lg font-medium text-zinc-300">
            <a href="/" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/5 pb-4">Practice</a>
            <a href="/sessions" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/5 pb-4">Sessions</a>

            <div className="border-b border-white/5 pb-4">
              <button
                type="button"
                onClick={() => setIsMobileCategoriesOpen((v) => !v)}
                aria-expanded={isMobileCategoriesOpen}
                className="w-full flex items-center justify-between"
              >
                <span>Categories</span>
                <iconify-icon
                  icon="solar:alt-arrow-down-linear"
                  width="18"
                  class={`transition-transform duration-200 ${isMobileCategoriesOpen ? 'rotate-180' : ''}`}
                ></iconify-icon>
              </button>
              {isMobileCategoriesOpen && (
                <div className="mt-4 grid grid-cols-1 gap-1 animate-[fade-enter_0.2s_ease-out]">
                  <a
                    href="/categories"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-zinc-200"
                  >
                    <span>All categories</span>
                    <iconify-icon icon="solar:arrow-right-linear" width="14"></iconify-icon>
                  </a>
                  {NAV_CATEGORIES.map((c) => (
                    <a
                      key={c.key}
                      href={`/category/${c.key}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] text-sm text-zinc-300"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: c.accent, boxShadow: `0 0 10px ${c.accent}66` }}
                      ></span>
                      {c.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a href="/infographics" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/5 pb-4">Infographics</a>
            <a href="/about" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/5 pb-4">About</a>
            <a href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/5 pb-4">Contact</a>
            <a
              href="https://ko-fi.com/bipul"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
            >
              <iconify-icon icon="solar:heart-bold" width="16"></iconify-icon>
              Donate
            </a>

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
              <div className="mt-2 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <iconify-icon icon="solar:bell-bold" width="16" class="text-indigo-400"></iconify-icon>
                    <p className="text-sm text-zinc-100 font-semibold">Latest sessions</p>
                  </div>
                  <a href="/sessions" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-indigo-400 font-medium">View all →</a>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifLoading && notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-zinc-500">Loading…</div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-zinc-500">No new sessions</div>
                  ) : (
                    notifications.map((n) => (
                      <a
                        key={n.slug}
                        href={`/session/${n.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04] border-b border-white/5 last:border-b-0"
                      >
                        {n.featuredImage ? (
                          <img src={optimizedImage(n.featuredImage, { width: 96, height: 96, fit: 'cover' })} alt="" loading="lazy" width={48} height={48} className="w-12 h-12 rounded-lg object-cover border border-white/5 flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center flex-shrink-0">
                            <iconify-icon icon="solar:meditation-linear" width="20" class="text-indigo-300"></iconify-icon>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-zinc-100 font-medium line-clamp-2 leading-snug">{n.title}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
                            {n.category && <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">{n.category}</span>}
                            <span>·</span>
                            <span>{formatRelative(n.publishedAt)}</span>
                          </div>
                        </div>
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
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-start justify-center pt-[10vh] px-4 animate-[fade-enter_0.15s_ease-out]"
          onClick={closeSearch}
        >
          <div
            className="w-full max-w-xl bg-zinc-950/95 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
              <iconify-icon icon="solar:magnifer-linear" width="20" class="text-zinc-400"></iconify-icon>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search meditations, topics, authors…"
                className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 outline-none text-base"
              />
              <button
                onClick={closeSearch}
                aria-label="Close search"
                className="text-zinc-500 hover:text-zinc-300 text-[10px] font-medium px-2 py-1 border border-white/10 rounded-md tracking-wider"
              >
                ESC
              </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto">
              {notifLoading && allSessions.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-zinc-500">Loading sessions…</div>
              ) : !searchQuery.trim() ? (
                <div className="px-4 py-12 text-center">
                  <iconify-icon icon="solar:magnifer-linear" width="32" class="text-zinc-700 mb-2"></iconify-icon>
                  <p className="text-sm text-zinc-500">Start typing to search {allSessions.length} sessions</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm text-zinc-400">No matches for "{searchQuery}"</p>
                  <p className="text-xs text-zinc-600 mt-1">Try a different keyword or topic</p>
                </div>
              ) : (
                searchResults.map((s) => (
                  <a
                    key={s.slug}
                    href={`/session/${s.slug}`}
                    onClick={closeSearch}
                    className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.04] border-b border-white/5 last:border-b-0 group"
                  >
                    {s.featuredImage ? (
                      <img src={optimizedImage(s.featuredImage, { width: 112, height: 112, fit: 'cover' })} alt="" loading="lazy" width={56} height={56} className="w-14 h-14 rounded-lg object-cover border border-white/5 flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center flex-shrink-0">
                        <iconify-icon icon="solar:meditation-linear" width="22" class="text-indigo-300"></iconify-icon>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-100 font-medium line-clamp-1 group-hover:text-white">{s.title}</p>
                      {s.description && (
                        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{s.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-600">
                        {s.category && <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">{s.category}</span>}
                        {s.author && <><span>·</span><span>{s.author}</span></>}
                      </div>
                    </div>
                    <iconify-icon icon="solar:arrow-right-linear" width="16" class="text-zinc-700 group-hover:text-indigo-400 mt-1 flex-shrink-0"></iconify-icon>
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
