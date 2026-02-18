import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

const AdminGate: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const redirect = encodeURIComponent('/admin');
      window.location.href = `/auth/login?redirect=${redirect}`;
      return;
    }

    if (user.isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (user && !user.isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-medium text-zinc-100 tracking-tight">Access Denied</h1>
          <p className="text-sm text-zinc-500">
            You are signed in as <span className="text-zinc-300">{user.email}</span>, but this account does not have admin privileges.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default AdminGate;
