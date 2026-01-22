import { useAuth } from '@/features/auth/context/AuthContext';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute - Guards routes that require authentication
 * 
 * REDIRECT PATTERN:
 * When redirecting to login, we pass the current location in state.
 * LoginPage reads this and redirects back after successful login.
 * 
 * Example flow:
 * 1. User visits /programs (not logged in)
 * 2. ProtectedRoute redirects to /login with state.from = /programs
 * 3. User logs in successfully
 * 4. LoginPage reads state.from and navigates to /programs
 * 
 * The 'replace' prop prevents the login page from appearing in history,
 * so the back button works naturally after login.
 */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login, preserving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
