import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type HistoryState = { idx?: number | null } | null;

/**
 * Navigate to the previous in-app route when the history stack has a prior entry
 * (React Router sets `idx` on `history.state`); otherwise go to `fallbackTo`.
 */
export function useNavigateBack(fallbackTo: string, fallbackState?: unknown) {
  const navigate = useNavigate();

  return useCallback(() => {
    const state = window.history.state as HistoryState;
    const idx = state?.idx;
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1);
      return;
    }
    // First visit / hard refresh / deep link: `idx` may be 0 or absent — use fallback.
    navigate(fallbackTo, fallbackState !== undefined ? { state: fallbackState } : undefined);
  }, [navigate, fallbackTo, fallbackState]);
}
