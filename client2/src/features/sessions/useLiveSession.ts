import { useContext } from 'react';
import { LiveSessionContext } from './liveSessionContext';

export function useLiveSession() {
  const ctx = useContext(LiveSessionContext);
  if (!ctx) {
    throw new Error('useLiveSession must be used within LiveSessionProvider');
  }
  return ctx;
}
