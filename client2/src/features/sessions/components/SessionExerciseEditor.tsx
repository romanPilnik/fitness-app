import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useRef } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Trash2 } from 'lucide-react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ExerciseIdSelect } from '@/features/exercises/components/ExerciseIdSelect';
import { exerciseQueryKeys, fetchExerciseById } from '@/features/exercises/api';
import { useCurrentUser } from '@/features/users/useCurrentUser';
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
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

export function SessionExerciseEditor({
  ei,
  form,
  exerciseCount,
  onMoveUp,
  onMoveDown,
  onRemove,
}: Props) {
  const qc = useQueryClient();
  const me = useCurrentUser();
  const weightUnitLabel = me.data?.units === 'imperial' ? 'lb' : 'kg';

  const pickDialogRef = useRef<HTMLDialogElement>(null);
  const pickTitleId = useId();
  const setsFA = useFieldArray({
    control: form.control,
    name: `exercises.${ei}.sets`,
  });

  useEffect(() => {
    form.setValue(`exercises.${ei}.targetSets`, setsFA.fields.length);
  }, [ei, form, setsFA.fields.length]);

  const exerciseLabel =
    form.watch(`exercises.${ei}.exerciseName`)?.trim() || `Exercise ${ei + 1}`;
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
    hasTarget(tw) || hasTarget(ttr) || hasTarget(ttsr) || hasTarget(trir);

  const toolbarBtn =
    'transition-transform duration-150 active:scale-[0.96] active:brightness-95 hover:brightness-110';

  return (
    <section className="rounded-2xl border border-(--border) bg-[#0a0a0b] p-3 shadow-[var(--shadow)] sm:p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="min-w-0 text-xl font-semibold leading-snug text-(--text-h) sm:text-2xl md:text-[1.65rem]">
          {exerciseLabel}
        </h2>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            className={cn('min-h-14 min-w-14 px-0 sm:min-h-[3.75rem] sm:min-w-[3.75rem]', toolbarBtn)}
            disabled={ei === 0}
            onClick={onMoveUp}
            aria-label="Move exercise up"
          >
            <ChevronUp className="mx-auto size-7" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="secondary"
            className={cn('min-h-14 min-w-14 px-0 sm:min-h-[3.75rem] sm:min-w-[3.75rem]', toolbarBtn)}
            disabled={ei >= exerciseCount - 1}
            onClick={onMoveDown}
            aria-label="Move exercise down"
          >
            <ChevronDown className="mx-auto size-7" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="secondary"
            className={cn('min-h-14 min-w-14 px-0 sm:min-h-[3.75rem] sm:min-w-[3.75rem]', toolbarBtn)}
            onClick={() => pickDialogRef.current?.showModal()}
            aria-label="Change exercise"
          >
            <RefreshCw className="mx-auto size-7" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="secondary"
            className={cn(
              'min-h-14 min-w-14 px-0 text-red-600 hover:bg-red-950/30 sm:min-h-[3.75rem] sm:min-w-[3.75rem]',
              toolbarBtn,
            )}
            disabled={exerciseCount <= 1}
            onClick={onRemove}
            aria-label="Remove exercise"
          >
            <Trash2 className="mx-auto size-7" aria-hidden />
          </Button>
        </div>
      </div>

      <input type="hidden" {...form.register(`exercises.${ei}.order`)} />

      <dialog
        ref={pickDialogRef}
        className="fixed top-1/2 left-1/2 z-50 w-[min(100%-2rem,28rem)] max-h-[min(80vh,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-(--border) bg-(--bg) p-4 shadow-[var(--shadow)]"
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
        <p className="mt-2 text-xs text-(--text)">
          Session targets
          {hasTarget(tw) ? <span className="ml-1">· weight {String(tw)}</span> : null}
          {hasTarget(ttr) ? <span className="ml-1">· total reps {String(ttr)}</span> : null}
          {hasTarget(ttsr) ? <span className="ml-1">· top-set reps {String(ttsr)}</span> : null}
          {hasTarget(trir) ? <span className="ml-1">· RIR {String(trir)}</span> : null}
        </p>
      ) : null}

      <div className="mt-3 flex flex-col gap-2">
        {setsFA.fields.map((sf, si) => {
          const setCompleted = form.watch(`exercises.${ei}.sets.${si}.setCompleted`);
          const repsField = form.register(`exercises.${ei}.sets.${si}.reps`);
          const weightField = form.register(`exercises.${ei}.sets.${si}.weight`);
          const rirField = form.register(`exercises.${ei}.sets.${si}.rir`);
          const fieldClass =
            'no-spinner h-11 min-h-11 w-[4.25rem] shrink-0 rounded-lg border border-(--border) pl-3 pr-2 text-base tabular-nums text-(--text-h) sm:h-12 sm:min-h-12 sm:w-[4.75rem] sm:pl-4 sm:pr-2.5 sm:text-lg';
          const unitClass = 'shrink-0 pl-0.5 text-sm font-medium tabular-nums text-(--text) sm:text-base';
          return (
            <div
              key={sf.id}
              className="flex min-h-[3.25rem] items-center gap-2 rounded-xl border border-(--border) bg-(--bg)/80 px-2.5 py-2 sm:min-h-14 sm:gap-2.5 sm:px-3 sm:py-2.5"
            >
              <button
                type="button"
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors sm:size-11 sm:text-base',
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
                onClick={() =>
                  form.setValue(`exercises.${ei}.sets.${si}.setCompleted`, !setCompleted)
                }
              >
                {si + 1}
              </button>

              <div className="min-w-0 flex-1 touch-pan-x overflow-x-auto [-webkit-overflow-scrolling:touch]">
                <div className="flex w-max items-center gap-4 sm:gap-6 md:gap-8">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <input
                      type="number"
                      min={0}
                      className={fieldClass}
                      {...weightField}
                      onFocus={(e) => e.currentTarget.select()}
                    />
                    <span className={unitClass}>{weightUnitLabel}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <input
                      type="number"
                      min={0}
                      className={fieldClass}
                      {...repsField}
                      onFocus={(e) => e.currentTarget.select()}
                    />
                    <span className={unitClass}>reps</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      className={cn(fieldClass, 'w-[3.75rem] sm:w-16')}
                      {...rirField}
                      onFocus={(e) => e.currentTarget.select()}
                    />
                    <span className={unitClass}>RIR</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex w-full gap-2.5 sm:gap-3">
        <Button
          type="button"
          variant="secondary"
          className="min-h-12 flex-1 text-base font-semibold sm:min-h-14 sm:text-lg"
          onClick={() => setsFA.append(oneEmptySet())}
        >
          + Set
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="min-h-12 flex-1 text-base font-semibold sm:min-h-14 sm:text-lg"
          disabled={setsFA.fields.length <= 1}
          onClick={() => setsFA.remove(setsFA.fields.length - 1)}
        >
          - Set
        </Button>
      </div>
    </section>
  );
}
