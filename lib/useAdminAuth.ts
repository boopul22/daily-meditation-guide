import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function useAdminAuth() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const redirect = encodeURIComponent('/admin/dashboard');
      window.location.href = `/auth/login?redirect=${redirect}`;
      return;
    }

    if (!user.isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, loading, navigate]);

  return { isAdmin: !!user?.isAdmin, loading, user };
}
