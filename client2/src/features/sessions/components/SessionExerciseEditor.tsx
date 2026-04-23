import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { useConfirm } from '@/components/ConfirmProvider';
import { Button } from '@/components/ui/button';
import { ExerciseIdSelect } from '@/features/exercises/components/ExerciseIdSelect';
import { exerciseQueryKeys, fetchExerciseById } from '@/features/exercises/api';
import { useCurrentUser } from '@/features/users/useCurrentUser';
import { useDisplayRirPreference } from '@/lib/displayRirPreference';
import { cn } from '@/lib/utils';
import { oneEmptySet } from '../sessionFormDefaults';
import type { LogSessionForm } from '../schemas';

function hasTarget(n: unknown): boolean {
  if (n === '' || n == null || n === undefined) return false;
  const x = typeof n === 'number' ? n : Number(n);
  return !Number.isNaN(x);
}

type Props = {
  ei: number;
  form: UseFormReturn<LogSessionForm, unknown, LogSessionForm>;
  exerciseCount: number;
  onOpenReorder: () => void;
  onRemove: () => void;
};

export function SessionExerciseEditor({
  ei,
  form,
  exerciseCount,
  onOpenReorder,
  onRemove,
}: Props) {
  const confirm = useConfirm();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const me = useCurrentUser();
  const displayRir = useDisplayRirPreference();
  const weightUnitLabel = me.data?.units === 'imperial' ? 'lb' : 'kg';

  const pickDialogRef = useRef<HTMLDialogElement>(null);
  const pickTitleId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);
  const setsFA = useFieldArray({
    control: form.control,
    name: `exercises.${ei}.sets`,
  });

  useEffect(() => {
    form.setValue(`exercises.${ei}.targetSets`, setsFA.fields.length);
  }, [ei, form, setsFA.fields.length]);

  const exerciseLabel = form.watch(`exercises.${ei}.exerciseName`)?.trim() || `Exercise ${ei + 1}`;
  const exerciseId = form.watch(`exercises.${ei}.exerciseId`) ?? '';
  const tw = form.watch(`exercises.${ei}.targetWeight`);
  const ttr = form.watch(`exercises.${ei}.targetTotalReps`);
  const ttsr = form.watch(`exercises.${ei}.targetTopSetReps`);
  const trir = form.watch(`exercises.${ei}.targetRir`);

  const onExerciseIdChange = (id: string) => {
    void (async () => {
      form.setValue(`exercises.${ei}.exerciseId`, id);
      if (!id) {
        form.setValue(`exercises.${ei}.exerciseName`, undefined);
        pickDialogRef.current?.close();
        return;
      }
      const ex = await qc.fetchQuery({
        queryKey: exerciseQueryKeys.detail(id),
        queryFn: () => fetchExerciseById(id),
      });
      form.setValue(`exercises.${ei}.exerciseName`, ex.name);
      pickDialogRef.current?.close();
    })();
  };

  const showExerciseTargets =
    hasTarget(tw) || hasTarget(ttr) || hasTarget(ttsr) || (displayRir && hasTarget(trir));

  return (
    <section className="rounded-2xl border border-(--border) bg-[#0a0a0b] p-2.5 shadow-(--shadow) sm:p-3 md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="min-w-0 flex-1 text-xl font-semibold leading-snug text-(--text-h) sm:text-2xl md:text-[1.65rem]">
          {exerciseLabel}
        </h2>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            aria-label={`Exercise options: ${exerciseLabel}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="inline-flex size-11 items-center justify-center rounded-lg border border-(--border) text-(--text-h) transition-colors hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border) disabled:pointer-events-none disabled:opacity-50"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MoreVertical className="size-4" strokeWidth={2.25} aria-hidden />
          </button>
          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-1 min-w-52 rounded-lg border border-(--border) bg-(--bg) py-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10"
            >
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2.5 text-left text-sm text-(--text-h) hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-inset"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenReorder();
                }}
              >
                Reorder exercises
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2.5 text-left text-sm text-(--text-h) hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-inset"
                onClick={() => {
                  setMenuOpen(false);
                  pickDialogRef.current?.showModal();
                }}
              >
                Swap exercise
              </button>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-inset dark:text-red-400"
                disabled={exerciseCount <= 1}
                onClick={() => {
                  setMenuOpen(false);
                  void confirm(`Remove “${exerciseLabel}” from this workout?`, {
                    confirmLabel: 'Remove',
                    cancelLabel: 'Cancel',
                  }).then((ok) => {
                    if (ok) onRemove();
                  });
                }}
              >
                Remove exercise
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <input type="hidden" {...form.register(`exercises.${ei}.order`)} />

      <dialog
        ref={pickDialogRef}
        className="fixed top-1/2 left-1/2 z-50 w-[min(100%-2rem,28rem)] max-h-[min(80vh,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-(--border) bg-(--bg) p-4 shadow-(--shadow)"
        aria-labelledby={pickTitleId}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 id={pickTitleId} className="text-base font-medium text-(--text-h)">
              Choose exercise
            </h3>
            <Button
              type="button"
              variant="secondary"
              className="min-h-11 shrink-0 px-4 text-sm font-medium"
              onClick={() => pickDialogRef.current?.close()}
            >
              Close
            </Button>
          </div>
          <ExerciseIdSelect
            id={`session-ex-${ei}`}
            value={exerciseId}
            onChange={onExerciseIdChange}
          />
        </div>
      </dialog>

      {showExerciseTargets ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {hasTarget(tw) ? (
            <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs font-medium tabular-nums text-zinc-500">
              Weight {String(tw)} {weightUnitLabel}
            </span>
          ) : null}
          {hasTarget(ttr) ? (
            <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs font-medium tabular-nums text-zinc-500">
              Total reps {String(ttr)}
            </span>
          ) : null}
          {hasTarget(ttsr) ? (
            <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs font-medium tabular-nums text-zinc-500">
              Top-set reps {String(ttsr)}
            </span>
          ) : null}
          {displayRir && hasTarget(trir) ? (
            <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs font-medium tabular-nums text-zinc-500">
              RIR {String(trir)}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-2 flex flex-col gap-1.5">
        {setsFA.fields.map((sf, si) => {
          const setCompleted = form.watch(`exercises.${ei}.sets.${si}.setCompleted`);
          const repsWatched = form.watch(`exercises.${ei}.sets.${si}.reps`);
          const weightWatched = form.watch(`exercises.${ei}.sets.${si}.weight`);
          const setTargetWeight = form.watch(`exercises.${ei}.sets.${si}.targetWeight`);
          const setTargetReps = form.watch(`exercises.${ei}.sets.${si}.targetReps`);
          const repsField = form.register(`exercises.${ei}.sets.${si}.reps`);
          const weightField = form.register(`exercises.${ei}.sets.${si}.weight`);
          const rirField = form.register(`exercises.${ei}.sets.${si}.rir`);

          const displayTargetWeight = hasTarget(setTargetWeight)
            ? Number(setTargetWeight)
            : undefined;
          const displayTargetReps = hasTarget(setTargetReps) ? Number(setTargetReps) : undefined;
          const displayTargetRir =
            displayRir && hasTarget(trir) ? Number(trir) : undefined;

          const repsNum = typeof repsWatched === 'number' ? repsWatched : Number(repsWatched) || 0;
          const weightNum =
            typeof weightWatched === 'number' ? weightWatched : Number(weightWatched) || 0;
          const showIncompleteLoggedHint = setCompleted && (repsNum === 0 || weightNum === 0);

          const fieldClass =
            'no-spinner h-10 min-h-10 min-w-0 w-full max-w-[4rem] flex-none rounded-md border border-(--border) pl-1 pr-0.5 text-sm tabular-nums text-(--text-h) sm:max-w-[4.5rem] sm:h-11 sm:min-h-11 sm:rounded-lg sm:pl-2 sm:pr-1 sm:text-base md:max-w-24 md:h-12 md:min-h-12 md:pl-3 md:pr-2 md:text-lg';
          const unitClass =
            'shrink-0 whitespace-nowrap pl-0.5 text-[0.6875rem] font-medium tabular-nums text-(--text) sm:pl-1 sm:text-sm md:text-base';
          const targetClass =
            'block w-full max-w-full truncate text-left text-[0.625rem] leading-tight font-medium tabular-nums text-zinc-500 sm:text-[0.6875rem]';

          return (
            <div key={sf.id} className="flex flex-col gap-1">
              <div
                className={cn(
                  'flex w-full min-w-0 items-end gap-1.5 rounded-xl border px-1.5 py-1.5 sm:gap-2 sm:px-2.5 sm:py-2',
                  setCompleted
                    ? 'border-emerald-500/30 bg-emerald-950/20'
                    : 'border-(--border) bg-(--bg)/80',
                )}
              >
                <input
                  type="hidden"
                  {...form.register(`exercises.${ei}.sets.${si}.targetWeight`)}
                />
                <input type="hidden" {...form.register(`exercises.${ei}.sets.${si}.targetReps`)} />

                <button
                  type="button"
                  className={cn(
                    'mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors sm:size-11 sm:text-base',
                    setCompleted
                      ? 'border-emerald-500/90 bg-emerald-600/45 text-emerald-50 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.35)]'
                      : 'border-(--border) bg-transparent text-(--text-h) hover:bg-(--social-bg)',
                  )}
                  aria-pressed={setCompleted}
                  aria-label={
                    setCompleted
                      ? `Set ${si + 1} completed — tap to undo`
                      : `Set ${si + 1} not completed — tap to mark done`
                  }
                  onClick={() => {
                    const next = !setCompleted;
                    form.setValue(`exercises.${ei}.sets.${si}.setCompleted`, next);
                  }}
                >
                  {si + 1}
                </button>

                <div className="flex w-full min-w-0 flex-1 items-end gap-2 sm:gap-2.5 md:gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    {displayTargetWeight != null && (
                      <span
                        className={targetClass}
                        title={`${displayTargetWeight} ${weightUnitLabel}`}
                      >
                        {displayTargetWeight} {weightUnitLabel}
                      </span>
                    )}
                    <div className="flex w-full min-w-0 items-center justify-start gap-0.5 sm:gap-1">
                      <input
                        type="number"
                        min={0}
                        className={fieldClass}
                        {...weightField}
                        onFocus={(e) => e.currentTarget.select()}
                      />
                      <span className={unitClass}>{weightUnitLabel}</span>
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    {displayTargetReps != null && (
                      <span className={targetClass} title={`${displayTargetReps} reps`}>
                        {displayTargetReps} reps
                      </span>
                    )}
                    <div className="flex w-full min-w-0 items-center justify-start gap-0.5 sm:gap-1">
                      <input
                        type="number"
                        min={0}
                        className={fieldClass}
                        {...repsField}
                        onFocus={(e) => e.currentTarget.select()}
                      />
                      <span className={unitClass}>reps</span>
                    </div>
                  </div>
                  {displayRir ? (
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      {displayTargetRir != null && (
                        <span className={targetClass} title={`${displayTargetRir} RIR`}>
                          {displayTargetRir} RIR
                        </span>
                      )}
                      <div className="flex w-full min-w-0 items-center justify-start gap-0.5 sm:gap-1">
                        <input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          className={fieldClass}
                          {...rirField}
                          onFocus={(e) => e.currentTarget.select()}
                        />
                        <span className={unitClass}>RIR</span>
                      </div>
                    </div>
                  ) : (
                    <input type="hidden" {...rirField} />
                  )}
                </div>
              </div>
              {showIncompleteLoggedHint ? (
                <p
                  className="pl-11 text-xs leading-snug text-amber-500/95 sm:pl-12"
                  aria-live="polite"
                >
                  Enter reps and weight first.
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex w-full gap-2 sm:gap-2.5">
        <Button
          type="button"
          variant="secondary"
          className="min-h-10 flex-1 text-sm font-semibold sm:min-h-11 sm:text-base"
          onClick={() => {
            const currentCount = setsFA.fields.length;
            const prescribed = form.getValues(`exercises.${ei}.targetSets`);
            if (currentCount < prescribed) {
              const exTw = form.getValues(`exercises.${ei}.targetWeight`);
              const exTr = form.getValues(`exercises.${ei}.targetTopSetReps`);
              setsFA.append(
                oneEmptySet(
                  exTw != null ? Number(exTw) : undefined,
                  exTr != null ? Number(exTr) : undefined,
                ),
                { shouldFocus: false },
              );
            } else {
              setsFA.append(oneEmptySet(), { shouldFocus: false });
            }
          }}
        >
          + Set
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="min-h-10 flex-1 text-sm font-semibold sm:min-h-11 sm:text-base"
          disabled={setsFA.fields.length <= 1}
          onClick={() => setsFA.remove(setsFA.fields.length - 1)}
        >
          - Set
        </Button>
      </div>
    </section>
  );
}
