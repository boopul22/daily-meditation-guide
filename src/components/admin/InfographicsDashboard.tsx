import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { $user, $authLoading, fetchCurrentUser, logout } from '../../stores/authStore';
import { fetchInfographics, deleteInfographic } from '../../lib/api';
import type { Infographic } from '../../types';

type StatusFilter = 'all' | 'published' | 'draft';

const REFRESH_INTERVAL = 30000;

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  status === 'published'
    ? <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Live</span>
    : <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Draft</span>
);

const InfographicsDashboard: React.FC = () => {
  const user = useStore($user);
  const authLoading = useStore($authLoading);
  const [items, setItems] = useState<Infographic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user && authLoading) {
      fetchCurrentUser();
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const redirect = encodeURIComponent('/admin/infographics');
      window.location.href = `/auth/login?redirect=${redirect}`;
      return;
    }
    if (!user.isAdmin) {
      window.location.href = '/admin';
    }
  }, [user, authLoading]);

  const isAuth = !!user?.isAdmin;

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await fetchInfographics();
      setItems(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuth) return;
    load(true);
    refreshTimer.current = setInterval(() => load(false), REFRESH_INTERVAL);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [isAuth, load]);

  const handleDelete = async (slug: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteInfographic(slug);
      setItems(prev => prev.filter(i => i.slug !== slug));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin';
  };

  if (!isAuth) return null;

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
  const draftCount = items.filter(i => i.status === 'draft').length;
  const publishedCount = items.filter(i => i.status === 'published').length;

  return (
    <div className="space-y-4 md:space-y-6 animate-[fade-enter_0.5s_ease-out] -mx-2 md:mx-0">
      <div className="flex items-center justify-between px-2 md:px-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg md:text-2xl font-medium text-zinc-100 tracking-tight">Infographics</h1>
          <nav className="hidden md:flex items-center gap-3 text-xs text-zinc-500">
            <a href="/admin/dashboard" className="hover:text-zinc-200 transition-colors">Sessions</a>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-300">Infographics</span>
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <a
            href="/admin/infographics/new"
            className="px-3 md:px-4 py-1.5 md:py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-xs md:text-sm font-medium transition-colors"
          >
            + New
          </a>
          <button
            onClick={handleLogout}
            className="px-3 md:px-4 py-1.5 md:py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-lg text-zinc-400 text-xs md:text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {!loading && !error && items.length > 0 && (
        <div className="flex items-center gap-1 px-2 md:px-0">
          {([
            { key: 'all' as StatusFilter, label: 'All', count: items.length },
            { key: 'published' as StatusFilter, label: 'Published', count: publishedCount },
            { key: 'draft' as StatusFilter, label: 'Drafts', count: draftCount },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${filter === tab.key
                  ? 'bg-white/10 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === tab.key ? 'bg-white/10 text-zinc-300' : 'bg-white/5 text-zinc-600'
                }`}>{tab.count}</span>
            </button>
          ))}
        </div>
      )}

      {loading && <p className="text-zinc-500 px-2 md:px-0">Loading infographics...</p>}
      {error && <p className="text-red-400 px-2 md:px-0">{error}</p>}

      {!loading && !error && (
        <div className="border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-900/50">
                <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Preview</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Tags</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-12 h-12 object-cover rounded border border-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-zinc-800 border border-white/10" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-zinc-200 font-medium">{item.title}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">/{item.slug}</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {item.tags?.slice(0, 3).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/admin/infographics/edit/${item.slug}`}
                        className="px-3 py-1 text-xs border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        Edit
                      </a>
                      <button
                        onClick={() => handleDelete(item.slug, item.title)}
                        className="px-3 py-1 text-xs border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 rounded-md text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-zinc-600 py-8">
              {filter === 'all' ? 'No infographics yet. Create your first one!' : `No ${filter} infographics.`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default InfographicsDashboard;
