import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../lib/useAdminAuth';
import { fetchSessions, deleteSession, logout } from '../../lib/api';
import { Session } from '../../types';

const AdminDashboard: React.FC = () => {
  const isAuth = useAdminAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuth) return;
    fetchSessions()
      .then(setSessions)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuth]);

  const handleDelete = async (slug: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteSession(slug);
      setSessions(prev => prev.filter(s => s.slug !== slug));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  if (!isAuth) return null;

  return (
    <div className="space-y-6 animate-[fade-enter_0.5s_ease-out]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-zinc-100 tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/new"
            className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-sm font-medium transition-colors"
          >
            + New Session
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-lg text-zinc-400 text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {loading && <p className="text-zinc-500">Loading sessions...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-900/50">
                <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Author</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Duration</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sessions.map(session => (
                <tr key={session.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm text-zinc-200 font-medium">{session.title}</p>
                    <p className="text-xs text-zinc-600 md:hidden">{session.category}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400 hidden md:table-cell">{session.category}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400 hidden md:table-cell">{session.author}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400 hidden sm:table-cell">{session.duration}</td>
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
          {sessions.length === 0 && (
            <p className="text-center text-zinc-600 py-8">No sessions yet. Create your first one!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
