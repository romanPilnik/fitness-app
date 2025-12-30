import { useAuth } from '../features/auth/context/AuthContext';
import { Outlet, Navigate } from 'react-router-dom';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}
