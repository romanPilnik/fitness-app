import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
  open: boolean;
  blockLocationKey: string | undefined;
  message: string;
  stayLabel: string;
  leaveLabel: string;
  onStay: () => void;
  onLeave: () => void;
  titleId: string;
};

export function NavigationLeaveDialog({
  open,
  blockLocationKey,
  message,
  stayLabel,
  leaveLabel,
  onStay,
  onLeave,
  titleId,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!open || !el) return;
    el.showModal();
    return () => {
      el.close();
    };
  }, [open, blockLocationKey]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed top-1/2 left-1/2 z-100 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-(--border) bg-(--bg) p-0 shadow-(--shadow)"
      aria-labelledby={titleId}
      aria-modal="true"
      role="alertdialog"
      onCancel={(e) => {
        e.preventDefault();
        onStay();
      }}
    >
      <div className="flex max-h-[min(28rem,calc(100dvh-2rem))] flex-col gap-5 overflow-y-auto px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]">
        <p
          id={titleId}
          className="text-base font-medium leading-snug tracking-tight text-pretty text-(--text-h)"
        >
          {message}
        </p>
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="secondary"
            className="min-h-12 w-full justify-center text-base"
            onClick={onStay}
          >
            {stayLabel}
          </Button>
          <Button type="button" className="min-h-12 w-full justify-center text-base" onClick={onLeave}>
            {leaveLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
