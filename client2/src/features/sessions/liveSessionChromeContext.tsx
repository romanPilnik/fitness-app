/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type LiveSessionChromeApi = {
  workoutTitleLine: string;
  elapsedLabel: string;
  isPaused: boolean;
  onQuit: () => void;
  onPauseToggle: () => void;
  onOpenGear: () => void;
  onComplete: () => void;
  completeDisabled: boolean;
};

type LiveSessionChromeContextValue = {
  chrome: LiveSessionChromeApi | null;
  setChrome: (api: LiveSessionChromeApi | null) => void;
};

const LiveSessionChromeContext = createContext<LiveSessionChromeContextValue | null>(null);

export function LiveSessionChromeProvider({ children }: { children: ReactNode }) {
  const [chrome, setChrome] = useState<LiveSessionChromeApi | null>(null);
  const value = useMemo(() => ({ chrome, setChrome }), [chrome]);
  return (
    <LiveSessionChromeContext.Provider value={value}>{children}</LiveSessionChromeContext.Provider>
  );
}

export function useLiveSessionChrome(): LiveSessionChromeContextValue {
  const ctx = useContext(LiveSessionChromeContext);
  if (!ctx) {
    throw new Error('useLiveSessionChrome requires LiveSessionChromeProvider');
  }
  return ctx;
}
