import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '@/api/queryClient';
import { setAuthTokenReader } from '@/api/authToken';
import { setUnauthorizedHandler } from '@/api/unauthorized';
import { AuthContext } from './auth-context';
import { userQueryKeys } from '@/features/users/api';
import { clearStoredSession, getStoredToken, readStoredSession, setStoredSession } from './storage';
import type { AuthUser } from './types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const initial = readStoredSession();
  const [user, setUser] = useState<AuthUser | null>(initial.user);
  const [token, setToken] = useState<string | null>(initial.token);

  useLayoutEffect(() => {
    setAuthTokenReader(() => getStoredToken());
    setUnauthorizedHandler(() => {
      queryClient.removeQueries({ queryKey: userQueryKeys.me() });
      clearStoredSession();
      setUser(null);
      setToken(null);
      navigate('/login', { replace: true });
    });
    return () => {
      setAuthTokenReader(() => null);
      setUnauthorizedHandler(() => {
        window.location.assign('/login');
      });
    };
  }, [navigate]);

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    queryClient.removeQueries({ queryKey: userQueryKeys.me() });
    setStoredSession(newToken, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    queryClient.removeQueries({ queryKey: userQueryKeys.me() });
    clearStoredSession();
    setToken(null);
    setUser(null);
  }, []);

  const setAuthUser = useCallback((newUser: AuthUser) => {
    const t = getStoredToken();
    if (t) setStoredSession(t, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      setAuthUser,
    }),
    [user, token, login, logout, setAuthUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
