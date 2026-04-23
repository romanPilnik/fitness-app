import { createContext } from 'react';
import type { AuthUser } from './types';

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void | Promise<void>;
  setAuthUser: (user?: AuthUser) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
