import type { AuthUser } from './types';

const TOKEN_KEY = 'onlyfitness_token';
const USER_KEY = 'onlyfitness_user';

function safeGetItem(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return safeGetItem(TOKEN_KEY);
}

export function readStoredSession(): { user: AuthUser | null; token: string | null } {
  const t = getStoredToken();
  const raw = safeGetItem(USER_KEY);
  if (!t || !raw) {
    return { user: null, token: null };
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'id' in parsed &&
      'email' in parsed &&
      'name' in parsed
    ) {
      return { token: t, user: parsed as AuthUser };
    }
    clearStoredSession();
  } catch {
    clearStoredSession();
  }
  return { user: null, token: null };
}

export function setStoredSession(token: string, userJson: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, userJson);
}

export function clearStoredSession(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
