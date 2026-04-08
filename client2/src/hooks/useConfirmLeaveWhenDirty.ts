import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useBlocker, type BlockerFunction } from 'react-router-dom';
import { useConfirm } from '@/components/ConfirmProvider';

const UNSAVED_MSG = 'You have unsaved changes. Leave this page?';

/**
 * Blocks in-app navigation and tab close/refresh while the form is dirty.
 * Uses in-app confirm (not `window.confirm`) so prompts work on iOS PWA / standalone.
 * Call `prepareLeave()` immediately before programmatic navigation that should not prompt (save, quit, delete).
 */
export function useConfirmLeaveWhenDirty(isDirty: boolean): () => void {
  const allowLeaveRef = useRef(false);
  const confirmLeave = useConfirm();
  const blockerRef = useRef<ReturnType<typeof useBlocker> | null>(null);

  const prepareLeave = useCallback(() => {
    allowLeaveRef.current = true;
  }, []);

  const shouldBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) => {
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
    [isDirty],
  );

  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    blockerRef.current = blocker;
  }, [blocker]);

  const blockSig = useMemo(() => {
    if (blocker.state !== 'blocked') return null;
    return `${blocker.location.key}|${blocker.location.pathname}${blocker.location.search}${blocker.location.hash}`;
  }, [blocker.state, blocker.location]);

  const processedSigRef = useRef<string | null>(null);

  useEffect(() => {
    if (blockSig == null) {
      processedSigRef.current = null;
      return;
    }
    if (processedSigRef.current === blockSig) return;
    processedSigRef.current = blockSig;

    void confirmLeave(UNSAVED_MSG, {
      confirmLabel: 'Leave',
      cancelLabel: 'Stay',
    }).then((ok) => {
      const b = blockerRef.current;
      if (!b || b.state !== 'blocked') return;
      if (ok) {
        allowLeaveRef.current = true;
        b.proceed();
      } else {
        b.reset();
      }
    });
  }, [blockSig, confirmLeave]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  return prepareLeave;
}
