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
  /**
   * Third action, rendered as the primary (accent) button after cancel + confirm.
   * When set, resolve returns `'save'` if chosen; otherwise `false` (cancel) or `true` (confirm).
   */
  extraLabel?: string;
};

type ConfirmResolve = boolean | 'save';

type Pending = ConfirmOptions & { resolve: (value: ConfirmResolve) => void };

const ConfirmContext = createContext<
  ((message: string, options?: Omit<ConfirmOptions, 'message'>) => Promise<ConfirmResolve>) | null
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
    return new Promise<ConfirmResolve>((resolve) => {
      setPending((prev) => {
        if (prev) prev.resolve(false);
        return {
          message,
          confirmLabel: options?.confirmLabel,
          cancelLabel: options?.cancelLabel,
          singleButton: options?.singleButton,
          extraLabel: options?.extraLabel,
          resolve,
        };
      });
    });
  }, []);

  const finish = useCallback((value: ConfirmResolve) => {
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
        className="fixed top-1/2 left-1/2 z-100 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-(--border) bg-(--bg) p-0 shadow-(--shadow)"
        aria-labelledby={titleId}
        aria-modal="true"
        role="alertdialog"
        onCancel={(e) => {
          e.preventDefault();
          finish(false);
        }}
      >
        {pending ? (
          <div className="flex max-h-[min(28rem,calc(100dvh-2rem))] flex-col gap-5 overflow-y-auto px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]">
            <p
              id={titleId}
              className="text-base font-medium leading-snug tracking-tight text-pretty text-(--text-h)"
            >
              {pending.message}
            </p>
            <div className="flex flex-col gap-3">
              {pending.singleButton ? (
                <Button
                  type="button"
                  className="min-h-12 w-full justify-center text-base"
                  onClick={() => finish(true)}
                >
                  {pending.confirmLabel ?? 'OK'}
                </Button>
              ) : pending.extraLabel ? (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-12 w-full justify-center text-base"
                    onClick={() => finish(false)}
                  >
                    {pending.cancelLabel ?? 'Cancel'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-12 w-full justify-center text-base"
                    onClick={() => finish(true)}
                  >
                    {pending.confirmLabel ?? 'OK'}
                  </Button>
                  <Button
                    type="button"
                    className="min-h-12 w-full justify-center text-base"
                    onClick={() => finish('save')}
                  >
                    {pending.extraLabel}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-12 w-full justify-center text-base"
                    onClick={() => finish(false)}
                  >
                    {pending.cancelLabel ?? 'Cancel'}
                  </Button>
                  <Button
                    type="button"
                    className="min-h-12 w-full justify-center text-base"
                    onClick={() => finish(true)}
                  >
                    {pending.confirmLabel ?? 'OK'}
                  </Button>
                </>
              )}
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
