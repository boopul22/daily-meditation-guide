import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../lib/useAdminAuth';
import { useAuth } from '../../lib/AuthContext';
import { fetchSessions, deleteSession } from '../../lib/api';
import { Session } from '../../types';

type StatusFilter = 'all' | 'published' | 'draft';

const REFRESH_INTERVAL = 30000; // 30 seconds

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  status === 'published'
    ? <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Live</span>
    : <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Draft</span>
);

const AdminDashboard: React.FC = () => {
  const { isAdmin: isAuth, loading: authLoading } = useAdminAuth();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadSessions = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await fetchSessions();
      setSessions(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuth) return;
    loadSessions(true);

    // Periodic refresh for multi-admin sync
    refreshTimer.current = setInterval(() => loadSessions(false), REFRESH_INTERVAL);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [isAuth, loadSessions]);

  const handleDelete = async (slug: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteSession(slug);
      setSessions(prev => prev.filter(s => s.slug !== slug));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  if (!isAuth) return null;

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.status === filter);
  const draftCount = sessions.filter(s => s.status === 'draft').length;
  const publishedCount = sessions.filter(s => s.status === 'published').length;

  return (
    <div className="space-y-4 md:space-y-6 animate-[fade-enter_0.5s_ease-out] -mx-2 md:mx-0">
      <div className="flex items-center justify-between px-2 md:px-0">
        <h1 className="text-lg md:text-2xl font-medium text-zinc-100 tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            to="/admin/new"
            className="px-3 md:px-4 py-1.5 md:py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-xs md:text-sm font-medium transition-colors"
          >
            + New
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 md:px-4 py-1.5 md:py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-lg text-zinc-400 text-xs md:text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      {!loading && !error && sessions.length > 0 && (
        <div className="flex items-center gap-1 px-2 md:px-0">
          {([
            { key: 'all' as StatusFilter, label: 'All', count: sessions.length },
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

      {loading && <p className="text-zinc-500 px-2 md:px-0">Loading sessions...</p>}
      {error && <p className="text-red-400 px-2 md:px-0">{error}</p>}

      {!loading && !error && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-900/50">
                  <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Author</th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Last Edit By</th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(session => (
                  <tr key={session.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm text-zinc-200 font-medium">{session.title}</p>
                      {session.publishedAt && session.status === 'published' && (
                        <p className="text-[10px] text-zinc-600 mt-0.5">{new Date(session.publishedAt).toLocaleDateString()}</p>
                      )}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={session.status} /></td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{session.category}</td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{session.author}</td>
                    <td className="px-4 py-3">
                      {session.lastUpdatedBy ? (
                        <span className="text-[11px] text-zinc-500" title={session.lastUpdatedBy}>
                          {session.lastUpdatedBy.split('@')[0]}
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/edit/${session.slug}`}
                          className="px-3 py-1 text-xs border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(session.slug, session.title)}
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
                {filter === 'all' ? 'No sessions yet. Create your first one!' : `No ${filter} sessions.`}
              </p>
            )}
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-2 px-1">
            {filtered.map(session => (
              <div key={session.id} className="bg-zinc-900/30 border border-white/5 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-zinc-200 font-medium truncate">{session.title}</p>
                      <StatusBadge status={session.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-zinc-500">{session.category}</span>
                      {session.duration && <span className="text-[10px] text-zinc-600">{session.duration}</span>}
                      <span className="text-[10px] text-zinc-600">{session.author}</span>
                      {session.lastUpdatedBy && (
                        <span className="text-[10px] text-zinc-500">• {session.lastUpdatedBy.split('@')[0]}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-none">
                    <Link
                      to={`/admin/edit/${session.slug}`}
                      className="px-2.5 py-1 text-[11px] border border-white/10 rounded-md text-zinc-400"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(session.slug, session.title)}
                      className="px-2.5 py-1 text-[11px] border border-red-500/20 rounded-md text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-zinc-600 py-8">
                {filter === 'all' ? 'No sessions yet. Create your first one!' : `No ${filter} sessions.`}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
