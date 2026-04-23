import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useState, type RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExerciseIdSelect } from '@/features/exercises/components/ExerciseIdSelect';
import { exerciseQueryKeys, fetchExerciseById } from '@/features/exercises/api';
import { errorMessageFromUnknown } from '@/lib/utils';
import { defaultSets } from '../sessionFormDefaults';
import type { LogSessionForm } from '../schemas';

const MAX_SETS = 50;

type Props = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  resetSignal: number;
  defaultInsertIndex: number;
  exerciseLabels: string[];
  onAdd: (payload: { row: LogSessionForm['exercises'][number]; insertIndex: number }) => void;
};

export function AddSessionExerciseDialog({
  dialogRef,
  resetSignal,
  defaultInsertIndex,
  exerciseLabels,
  onAdd,
}: Props) {
  const qc = useQueryClient();
  const titleId = useId();
  const exerciseFieldId = useId();

  const [exerciseId, setExerciseId] = useState('');
  const [setCount, setSetCount] = useState(3);
  const [insertIndex, setInsertIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const n = exerciseLabels.length;
  const maxInsert = Math.max(0, n);

  useEffect(() => {
    if (resetSignal === 0) {
      return;
    }
    setExerciseId('');
    setSetCount(3);
    setInsertIndex(Math.max(0, Math.min(maxInsert, defaultInsertIndex)));
    setError(null);
  }, [resetSignal, defaultInsertIndex, maxInsert]);

  const onConfirm = async () => {
    if (!exerciseId) {
      setError('Select an exercise.');
      return;
    }
    setError(null);
    const sc = Math.max(1, Math.min(MAX_SETS, Math.floor(Number(setCount)) || 1));
    setAdding(true);
    try {
      const ex = await qc.fetchQuery({
        queryKey: exerciseQueryKeys.detail(exerciseId),
        queryFn: () => fetchExerciseById(exerciseId),
      });
      const row: LogSessionForm['exercises'][number] = {
        exerciseId: ex.id,
        exerciseName: ex.name,
        order: 1,
        targetSets: sc,
        targetWeight: undefined,
        targetTotalReps: undefined,
        targetTopSetReps: undefined,
        targetRir: undefined,
        sets: defaultSets(sc),
      };
      const idx = Math.max(0, Math.min(maxInsert, insertIndex));
      onAdd({ row, insertIndex: idx });
    } catch (e) {
      setError(errorMessageFromUnknown(e));
    } finally {
      setAdding(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed top-1/2 left-1/2 z-50 w-[min(100%-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-(--border) bg-(--bg) p-4 shadow-(--shadow)"
      aria-labelledby={titleId}
      aria-modal="true"
    >
      <h2 id={titleId} className="text-base font-medium text-(--text-h)">
        Add exercise
      </h2>

      <div className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-(--text-h)">
          Exercise
          <ExerciseIdSelect
            id={exerciseFieldId}
            value={exerciseId}
            onChange={(id) => {
              setExerciseId(id);
              if (id) {
                setError(null);
              }
            }}
            disabled={adding}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-(--text-h)">
          Sets
          <Input
            type="number"
            min={1}
            max={MAX_SETS}
            value={setCount}
            onChange={(e) => {
              const v = e.target.valueAsNumber;
              if (Number.isNaN(v)) {
                return;
              }
              setSetCount(Math.max(1, Math.min(MAX_SETS, v)));
            }}
            disabled={adding}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-(--text-h)">
          Position
          <select
            className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base text-(--text)"
            value={insertIndex}
            onChange={(e) => setInsertIndex(Number(e.target.value))}
            disabled={adding}
            aria-label="Position in exercise order"
          >
            <option value={0}>First</option>
            {exerciseLabels.map((label, i) => (
              <option key={i} value={i + 1}>
                After {label}
              </option>
            ))}
          </select>
        </label>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          className="min-h-12 w-full sm:w-auto"
          disabled={adding}
          onClick={() => {
            void onConfirm();
          }}
        >
          {adding ? 'Adding…' : 'Add'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="min-h-12 w-full sm:w-auto"
          disabled={adding}
          onClick={() => dialogRef.current?.close()}
        >
          Cancel
        </Button>
      </div>
    </dialog>
  );
}
