import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import { useBlocker, type BlockerFunction } from 'react-router-dom';
import { NavigationLeaveDialog } from '@/components/NavigationLeaveDialog';

const UNSAVED_MSG = 'You have unsaved changes. Leave this page?';

export type ConfirmLeaveWhenDirtyOptions = {
  /**
   * When `false`, in-app route changes are not blocked while dirty (tab close / refresh still warns).
   * Use when edits are persisted outside the router flow (e.g. live session draft to `sessionStorage`).
   */
  blockSpaNavigation?: boolean;
};

/**
 * Blocks in-app navigation and tab close/refresh while the form is dirty.
 * Uses a dedicated modal (not the shared ConfirmProvider queue) so other confirms
 * (quit workout, delete, etc.) cannot preempt the router blocker or leave it desynced.
 *
 * @returns `[prepareLeave, navigationLeavePrompt]` — render `navigationLeavePrompt` once in the page tree.
 * Call `prepareLeave()` immediately before programmatic navigation that should not prompt (save, quit, delete).
 */
export function useConfirmLeaveWhenDirty(
  isDirty: boolean,
  options?: ConfirmLeaveWhenDirtyOptions,
): readonly [prepareLeave: () => void, navigationLeavePrompt: ReactNode] {
  const blockSpaNavigation = options?.blockSpaNavigation ?? true;
  const allowLeaveRef = useRef(false);
  const blockerRef = useRef<ReturnType<typeof useBlocker> | null>(null);

  const prepareLeave = useCallback(() => {
    allowLeaveRef.current = true;
  }, []);

  const shouldBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) => {
      if (!blockSpaNavigation) return false;
      if (allowLeaveRef.current) return false;
      if (
        currentLocation.pathname === nextLocation.pathname &&
        currentLocation.search === nextLocation.search &&
        currentLocation.hash === nextLocation.hash
      ) {
        return false;
      }
      return isDirty;
    },
    [isDirty, blockSpaNavigation],
  );

  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    blockerRef.current = blocker;
  }, [blocker]);

  const titleId = useId();

  const onStay = useCallback(() => {
    const b = blockerRef.current;
    if (b?.state === 'blocked') {
      b.reset();
    }
  }, []);

  const onLeave = useCallback(() => {
    const b = blockerRef.current;
    if (b?.state !== 'blocked') return;
    allowLeaveRef.current = true;
    b.proceed();
  }, []);

  const blocked = blocker.state === 'blocked';
  const blockKey = blocked ? blocker.location.key : undefined;

  const navigationLeavePrompt = (
    <NavigationLeaveDialog
      open={blocked}
      blockLocationKey={blockKey}
      message={UNSAVED_MSG}
      stayLabel="Stay"
      leaveLabel="Leave"
      onStay={onStay}
      onLeave={onLeave}
      titleId={titleId}
    />
  );

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  return [prepareLeave, navigationLeavePrompt] as const;
}
