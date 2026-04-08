import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

export function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/home' : '/login'} replace />;
}
