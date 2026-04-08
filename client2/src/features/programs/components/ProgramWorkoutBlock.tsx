import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { exerciseQueryKeys, fetchExerciseById } from '@/features/exercises/api';
import { ExerciseIdSelect } from '@/features/exercises/components/ExerciseIdSelect';
import type { CustomProgramForm } from '../schemas';

function ExerciseNameLine({ exerciseId }: { exerciseId: string }) {
  const q = useQuery({
    queryKey: exerciseQueryKeys.detail(exerciseId),
    queryFn: () => fetchExerciseById(exerciseId),
    enabled: Boolean(exerciseId),
    staleTime: 60_000,
  });
  if (!exerciseId) {
    return <span className="text-sm text-(--text)">No exercise selected</span>;
  }
  if (q.isPending) {
    return <span className="text-sm text-(--text)">Loading…</span>;
  }
  return <span className="text-sm font-medium text-(--text-h)">{q.data?.name ?? 'Exercise'}</span>;
}

function ProgramWorkoutExerciseRow({
  wi,
  ei,
  field,
  form,
  onRemove,
  canRemove,
}: {
  wi: number;
  ei: number;
  field: { id: string };
  form: UseFormReturn<CustomProgramForm>;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const exerciseId = form.watch(`workouts.${wi}.exercises.${ei}.exerciseId`);
  const targetSets = form.watch(`workouts.${wi}.exercises.${ei}.targetSets`);

  const [expandedById, setExpandedById] = useState<Record<string, boolean | undefined>>({});

  const resolvedExpanded =
    field.id in expandedById
      ? Boolean(expandedById[field.id])
      : !exerciseId;

  const toggle = () => {
    setExpandedById((prev) => ({
      ...prev,
      [field.id]: !resolvedExpanded,
    }));
  };

  return (
    <div className="rounded-lg border border-(--border) bg-(--bg)">
      <div className="flex items-start gap-2 p-3">
        <button
          type="button"
          onClick={toggle}
          className="mt-0.5 shrink-0 rounded p-0.5 text-(--text) hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
          aria-expanded={resolvedExpanded}
          aria-label={resolvedExpanded ? 'Collapse exercise' : 'Expand exercise'}
        >
          {resolvedExpanded ? (
            <ChevronDown className="size-5" aria-hidden />
          ) : (
            <ChevronRight className="size-5" aria-hidden />
          )}
        </button>
        <div className="min-w-0 flex-1">
          {!resolvedExpanded ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <ExerciseNameLine exerciseId={exerciseId} />
              <span className="text-sm text-(--text)">· {targetSets ?? '—'} sets</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <ExerciseIdSelect
                id={`ex-${wi}-${ei}`}
                value={form.watch(`workouts.${wi}.exercises.${ei}.exerciseId`)}
                onChange={(id) => form.setValue(`workouts.${wi}.exercises.${ei}.exerciseId`, id)}
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-(--text)">Order</label>
                  <input
                    type="number"
                    min={1}
                    className="min-h-10 rounded border border-(--border) bg-(--bg) px-2"
                    {...form.register(`workouts.${wi}.exercises.${ei}.order`)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-(--text)">Target sets</label>
                  <input
                    type="number"
                    min={1}
                    className="min-h-10 rounded border border-(--border) bg-(--bg) px-2"
                    {...form.register(`workouts.${wi}.exercises.${ei}.targetSets`)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={toggle}
                className="self-start text-sm font-medium text-(--accent) underline-offset-2 hover:underline"
              >
                Collapse
              </button>
            </div>
          )}
        </div>
        {canRemove ? (
          <Button
            type="button"
            variant="secondary"
            className="size-11 shrink-0 p-0"
            onClick={onRemove}
            aria-label="Remove exercise"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function ProgramWorkoutBlock({
  wi,
  form,
  onRemoveDay,
  canRemoveDay,
}: {
  wi: number;
  form: UseFormReturn<CustomProgramForm>;
  onRemoveDay: () => void;
  canRemoveDay: boolean;
}) {
  const exercisesFA = useFieldArray({
    control: form.control,
    name: `workouts.${wi}.exercises`,
  });

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-(--border) p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-medium text-(--text-h)">Workout {wi + 1}</h2>
        {canRemoveDay ? (
          <Button type="button" variant="secondary" onClick={onRemoveDay}>
            Remove day
          </Button>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-(--text-h)">Name</label>
        <input
          className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base"
          {...form.register(`workouts.${wi}.name`)}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-(--text-h)">Day #</label>
        <input
          type="number"
          min={1}
          max={14}
          className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base"
          {...form.register(`workouts.${wi}.dayNumber`)}
        />
      </div>

      <h3 className="text-sm font-medium text-(--text-h)">Exercises</h3>
      {exercisesFA.fields.map((ef, ei) => (
        <ProgramWorkoutExerciseRow
          key={ef.id}
          wi={wi}
          ei={ei}
          field={ef}
          form={form}
          onRemove={() => exercisesFA.remove(ei)}
          canRemove={exercisesFA.fields.length > 1}
        />
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          exercisesFA.append({
            exerciseId: '',
            order: exercisesFA.fields.length + 1,
            targetSets: 3,
          })
        }
      >
        Add exercise
      </Button>
    </section>
  );
}
