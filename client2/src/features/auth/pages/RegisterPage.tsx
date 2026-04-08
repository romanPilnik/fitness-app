import { Navigate } from 'react-router-dom';
import { CenteredCardLayout } from '@/layouts/CenteredCardLayout';
import { RegisterForm } from '../components/RegisterForm';
import { useAuth } from '../useAuth';

export function RegisterPage() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <CenteredCardLayout title="Create account">
      <RegisterForm />
    </CenteredCardLayout>
  );
}
