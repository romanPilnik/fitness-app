import { createContext } from 'react';
import type { AuthUser } from './types';

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setAuthUser: (user: AuthUser) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
