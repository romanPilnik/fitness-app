import { Navigate } from 'react-router-dom';
import { CenteredCardLayout } from '@/layouts/CenteredCardLayout';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { LoginForm } from '../components/LoginForm';
import { SocialDivider } from '../components/SocialDivider';
import { useAuth } from '../useAuth';

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <CenteredCardLayout title="Sign in">
      <LoginForm />
      <SocialDivider />
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: '/home' })}
      >
        Continue with Google
      </Button>
    </CenteredCardLayout>
  );
}
