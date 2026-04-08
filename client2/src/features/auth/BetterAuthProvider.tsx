import { useCallback, useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '@/api/queryClient';
import { authClient } from '@/lib/auth-client';
import { AuthContext, type AuthContextValue } from './auth-context';
import { userQueryKeys } from '@/features/users/api';
import type { AuthUser } from './types';

export function BetterAuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { data: session, isPending, refetch } = authClient.useSession();

  const user: AuthUser | null = session?.user
    ? { id: session.user.id, email: session.user.email, name: session.user.name }
    : null;

  const login = useCallback((_token: string, _user: AuthUser) => {
    // No-op: Better Auth manages sessions via cookies.
    // The useSession hook auto-updates after signIn/signUp calls.
  }, []);

  const logout = useCallback(async () => {
    await authClient.signOut();
    queryClient.removeQueries({ queryKey: userQueryKeys.me() });
    navigate('/login', { replace: true });
  }, [navigate]);

  const setAuthUser = useCallback(
    (_user: AuthUser) => {
      // Refresh session so the auth context picks up updated user data
      void refetch();
    },
    [refetch],
  );

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      token: session?.session ? 'cookie-session' : null,
      isAuthenticated: Boolean(session?.user),
      login,
      logout,
      setAuthUser,
    }),
    [user, session, login, logout, setAuthUser],
  );

  if (isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-(--bg) px-4">
        <p className="text-sm text-(--text)">Loading...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
