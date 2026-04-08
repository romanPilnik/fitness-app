import { createContext } from 'react';
import type { LiveSessionRef } from './liveSessionStorage';

export type LiveSessionContextValue = {
  liveSession: LiveSessionRef | null;
  setLiveSession: (ref: LiveSessionRef) => void;
  clearLiveSession: () => void;
};

export const LiveSessionContext = createContext<LiveSessionContextValue | null>(null);
