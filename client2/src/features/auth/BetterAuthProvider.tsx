import { useCallback, useLayoutEffect, useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '@/api/queryClient';
import { setUnauthorizedHandler } from '@/api/unauthorized';
import { authClient } from '@/lib/auth-client';
import { AuthContext, type AuthContextValue } from './auth-context';
import { userQueryKeys } from '@/features/users/api';
import type { AuthUser } from './types';

export function BetterAuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { data: session, isPending, refetch } = authClient.useSession();

  const login = useCallback(() => {}, []);

  const logout = useCallback(async () => {
    await authClient.signOut();
    queryClient.removeQueries({ queryKey: userQueryKeys.me() });
    navigate('/login', { replace: true });
  }, [navigate]);

  const setAuthUser = useCallback(() => {
    void refetch();
  }, [refetch]);

  useLayoutEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.removeQueries({ queryKey: userQueryKeys.me() });
      void authClient.signOut().then(() => navigate('/login', { replace: true }));
    });
    return () => {
      setUnauthorizedHandler(() => {
        window.location.assign('/login');
      });
    };
  }, [navigate]);

  const value: AuthContextValue = useMemo(() => {
    const user: AuthUser | null = session?.user
      ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          emailVerified:
            'emailVerified' in session.user
              ? Boolean((session.user as { emailVerified?: boolean }).emailVerified)
              : undefined,
        }
      : null;
    return {
      user,
      isAuthenticated: Boolean(session?.user),
      login,
      logout,
      setAuthUser,
    };
  }, [session, login, logout, setAuthUser]);

  if (isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-(--bg) px-4">
        <p className="text-sm text-(--text)">Loading...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
