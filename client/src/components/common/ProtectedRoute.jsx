import { useAuth } from '@/features/auth/context/AuthContext';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
