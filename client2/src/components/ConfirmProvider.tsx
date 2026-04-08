/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Button } from '@/components/ui/button';

export type ConfirmOptions = {
  message: string;
  /** Primary / affirmative action (e.g. "Sign out", "Leave") */
  confirmLabel?: string;
  /** Dismiss / stay */
  cancelLabel?: string;
  /** Only the confirm button (resolve still returns `true` on click). */
  singleButton?: boolean;
};

type Pending = ConfirmOptions & { resolve: (value: boolean) => void };

const ConfirmContext = createContext<
  ((message: string, options?: Omit<ConfirmOptions, 'message'>) => Promise<boolean>) | null
>(null);

/**
 * In-app confirmations (native `window.confirm` is unreliable in iOS standalone/PWA and some WebViews).
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = dialogRef.current;
    if (!pending || !el) return;
    el.showModal();
    return () => {
      el.close();
    };
  }, [pending]);

  const confirm = useCallback((message: string, options?: Omit<ConfirmOptions, 'message'>) => {
    return new Promise<boolean>((resolve) => {
      setPending((prev) => {
        if (prev) prev.resolve(false);
        return {
          message,
          confirmLabel: options?.confirmLabel,
          cancelLabel: options?.cancelLabel,
          singleButton: options?.singleButton,
          resolve,
        };
      });
    });
  }, []);

  const finish = useCallback((value: boolean) => {
    setPending((p) => {
      if (p) p.resolve(value);
      return null;
    });
    dialogRef.current?.close();
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 z-100 w-[min(100%-2rem,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-(--border) bg-(--bg) p-4 shadow-(--shadow)"
        aria-labelledby={titleId}
        aria-modal="true"
        role="alertdialog"
        onCancel={(e) => {
          e.preventDefault();
          finish(false);
        }}
      >
        {pending ? (
          <div className="flex flex-col gap-4">
            <p id={titleId} className="text-base text-(--text-h)">
              {pending.message}
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              {pending.singleButton ? null : (
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11"
                  onClick={() => finish(false)}
                >
                  {pending.cancelLabel ?? 'Cancel'}
                </Button>
              )}
              <Button type="button" className="min-h-11" onClick={() => finish(true)}>
                {pending.confirmLabel ?? 'OK'}
              </Button>
            </div>
          </div>
        ) : null}
      </dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return ctx;
}
