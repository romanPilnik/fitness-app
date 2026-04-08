import { Navigate } from 'react-router-dom';
import { CenteredCardLayout } from '@/layouts/CenteredCardLayout';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../useAuth';

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <CenteredCardLayout title="Sign in">
      <LoginForm />
    </CenteredCardLayout>
  );
}
