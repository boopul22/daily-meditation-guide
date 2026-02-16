import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from './api';

export function useAdminAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  return isLoggedIn();
}
