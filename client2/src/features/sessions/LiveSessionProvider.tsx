import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { LiveSessionContext } from './liveSessionContext';
import { clearLiveSessionDraft } from './liveSessionDraftStorage';
import { readLiveSessionRef, writeLiveSessionRef, type LiveSessionRef } from './liveSessionStorage';

export function LiveSessionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [liveSession, setLiveState] = useState<LiveSessionRef | null>(() => readLiveSessionRef());

  const prevAuth = useRef<boolean | null>(null);
  const clearLiveSession = useCallback(() => {
    writeLiveSessionRef(null);
    clearLiveSessionDraft();
    setLiveState(null);
  }, []);

  useEffect(() => {
    if (prevAuth.current === true && isAuthenticated === false) {
      writeLiveSessionRef(null);
      clearLiveSessionDraft();
      queueMicrotask(() => {
        setLiveState(null);
      });
    }
    prevAuth.current = isAuthenticated;
  }, [isAuthenticated]);

  const setLiveSession = useCallback((ref: LiveSessionRef) => {
    writeLiveSessionRef(ref);
    setLiveState(ref);
  }, []);

  const value = useMemo(
    () => ({
      liveSession,
      setLiveSession,
      clearLiveSession,
    }),
    [liveSession, setLiveSession, clearLiveSession],
  );

  return <LiveSessionContext.Provider value={value}>{children}</LiveSessionContext.Provider>;
}
