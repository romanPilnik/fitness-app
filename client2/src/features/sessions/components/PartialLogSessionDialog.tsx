import { useEffect, useId, useRef } from 'react';
import { Button } from '@/components/ui/button';

export type PartialLogSessionChoice = 'save_as_is' | 'prune' | 'back';

type Props = {
  open: boolean;
  onChoice: (choice: PartialLogSessionChoice) => void;
};

/**
 * Incomplete workout: save as logged, strip uncompleted sets/exercises, or dismiss.
 */
export function PartialLogSessionDialog({ open, onChoice }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!open || !el) return;
    el.showModal();
    return () => {
      el.close();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="fixed top-1/2 left-1/2 z-100 w-[min(100%-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-(--border) bg-(--bg) p-4 shadow-(--shadow)"
      aria-labelledby={titleId}
      aria-modal="true"
      role="alertdialog"
      onCancel={(e) => {
        e.preventDefault();
        onChoice('back');
      }}
    >
      <div className="flex flex-col gap-4">
        <h2 id={titleId} className="text-base font-medium text-(--text-h)">
          Not every set is logged
        </h2>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            className="min-h-11 w-full"
            onClick={() => onChoice('save_as_is')}
          >
            Save as entered
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 w-full"
            onClick={() => onChoice('prune')}
          >
            Remove unfinished sets
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 w-full"
            onClick={() => onChoice('back')}
          >
            Keep editing
          </Button>
        </div>
      </div>
    </dialog>
  );
}
