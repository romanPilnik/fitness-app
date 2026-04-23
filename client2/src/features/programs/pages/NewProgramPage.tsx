import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useForm, useFormState, type Resolver } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import {
  API_VALIDATION_ERROR_CODE,
  applyApiValidationErrors,
} from '@/lib/applyApiValidationErrors';
import { toDatetimeLocalInputValue } from '@/lib/datetime';
import { errorMessageFromUnknown } from '@/lib/utils';
import { useConfirmLeaveWhenDirty } from '@/hooks/useConfirmLeaveWhenDirty';
import { ProgramScheduleFields } from '@/features/programs/components/ProgramScheduleFields';
import { ProgramWorkoutBlock } from '@/features/programs/components/ProgramWorkoutBlock';
import { defaultSyncPattern } from '@/features/programs/scheduleDefaults';
import { createCustomProgram, programQueryKeys } from '../api';
import { customProgramFormSchema, type CustomProgramForm } from '../schemas';

const DPW_DEFAULT = 3;

function seedWorkouts(n: number): CustomProgramForm['workouts'] {
  return Array.from({ length: n }, (_, i) => ({
    name: `Day ${i + 1}`,
    dayNumber: i + 1,
    exercises: [{ exerciseId: '', order: 1, targetSets: 3 }],
  }));
}

function defaultFormState(): Omit<CustomProgramForm, 'name' | 'description'> {
  const workouts = seedWorkouts(DPW_DEFAULT);
  return {
    difficulty: 'beginner',
    goal: 'hypertrophy',
    splitType: 'other',
    daysPerWeek: DPW_DEFAULT,
    startDate: toDatetimeLocalInputValue(new Date()),
    lengthWeeks: 8,
    scheduleKind: 'sync_week',
    syncPattern: defaultSyncPattern(workouts.length, DPW_DEFAULT),
    asyncPattern: [
      { type: 'workout', workoutIndex: 0 },
      { type: 'rest' },
    ],
    workouts,
  };
}

export function NewProgramPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const form = useForm<CustomProgramForm>({
    resolver: zodResolver(customProgramFormSchema) as Resolver<CustomProgramForm>,
    defaultValues: {
      name: '',
      description: '',
      ...defaultFormState(),
    },
  });

  const { isDirty } = useFormState({ control: form.control });
  const [prepareLeave, navigationLeavePrompt] = useConfirmLeaveWhenDirty(isDirty);

  const workoutsFA = useFieldArray({
    control: form.control,
    name: 'workouts',
  });

  const mutation = useMutation({
    mutationFn: createCustomProgram,
  });

  const daysPerWeekRegister = form.register('daysPerWeek', {
    valueAsNumber: true,
  });

  return (
    <>
      <SubpageHeader
        fallbackTo="/programs"
        title="New program"
        backLabel="Back to programs"
      />
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
        <p className="text-sm text-(--text)">Build a custom program from scratch.</p>

      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(async (values) => {
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const body = {
            name: values.name.trim(),
            description: values.description?.trim() || undefined,
            difficulty: values.difficulty,
            goal: values.goal,
            splitType: values.splitType,
            daysPerWeek: values.daysPerWeek,
            startDate: new Date(values.startDate.trim()).toISOString(),
            lengthWeeks: values.lengthWeeks,
            scheduleKind: values.scheduleKind,
            schedulePattern:
              values.scheduleKind === 'sync_week' ? values.syncPattern : values.asyncPattern,
            timeZone,
            workouts: values.workouts.map((w) => ({
              name: w.name.trim(),
              dayNumber: w.dayNumber,
              exercises: w.exercises.map((ex, ei) => ({
                exerciseId: ex.exerciseId,
                order: ex.order ?? ei + 1,
                targetSets: ex.targetSets,
                targetWeight: ex.targetWeight,
                targetTotalReps: ex.targetTotalReps,
                targetTopSetReps: ex.targetTopSetReps,
                targetRir: ex.targetRir,
              })),
            })),
          };
          try {
            await mutation.mutateAsync(body);
            prepareLeave();
            qc.invalidateQueries({ queryKey: programQueryKeys.all });
            navigate('/programs');
          } catch (e) {
            if (e instanceof ApiError) {
              if (
                e.code === API_VALIDATION_ERROR_CODE &&
                applyApiValidationErrors(e, form.setError)
              ) {
                mutation.reset();
                return;
              }
              mutation.reset();
              form.setError('root', {
                type: 'server',
                message: e.message,
              });
              return;
            }
            mutation.reset();
            form.setError('root', {
              type: 'server',
              message: errorMessageFromUnknown(e),
            });
          }
        })}
      >
        <section className="flex flex-col gap-3 rounded-xl border border-(--border) p-4">
          <h2 className="text-lg font-medium text-(--text-h)">Basics</h2>
          <div className="flex flex-col gap-1">
            <label htmlFor="np-name" className="text-sm font-medium text-(--text-h)">
              Name
            </label>
            <input
              id="np-name"
              className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base"
              {...form.register('name')}
            />
            {form.formState.errors.name?.message ? (
              <p className="text-sm text-red-600" role="alert">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="np-desc" className="text-sm font-medium text-(--text-h)">
              Description
            </label>
            <textarea
              id="np-desc"
              rows={2}
              className="rounded-lg border border-(--border) bg-(--bg) px-3 py-2 text-base"
              {...form.register('description')}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-(--text-h)">Difficulty</label>
              <select
                className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-2 text-base"
                {...form.register('difficulty')}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-(--text-h)">Goal</label>
              <select
                className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-2 text-base"
                {...form.register('goal')}
              >
                <option value="strength">Strength</option>
                <option value="hypertrophy">Hypertrophy</option>
                <option value="endurance">Endurance</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-(--text-h)">Split</label>
            <select
              className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-2 text-base"
              {...form.register('splitType')}
            >
              <option value="full_body">Full body</option>
              <option value="push_pull_legs">Push / pull / legs</option>
              <option value="upper_lower">Upper / lower</option>
              <option value="arnold">Arnold</option>
              <option value="modified_full_body">Modified full body</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="np-dpw" className="text-sm font-medium text-(--text-h)">
              Days per week
            </label>
            <input
              id="np-dpw"
              type="number"
              min={1}
              max={14}
              className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base"
              {...daysPerWeekRegister}
              onChange={(e) => {
                daysPerWeekRegister.onChange(e);
                const next = Number(e.target.value);
                if (!Number.isFinite(next) || next < 1 || next > 14) return;
                const workouts = form.getValues('workouts');
                form.setValue(
                  'syncPattern',
                  defaultSyncPattern(workouts.length, next) as CustomProgramForm['syncPattern'],
                  { shouldDirty: true },
                );
                if (next > workouts.length) {
                  const toAdd = next - workouts.length;
                  const start = workouts.length;
                  for (let i = 0; i < toAdd; i++) {
                    workoutsFA.append({
                      name: `Day ${start + i + 1}`,
                      dayNumber: start + i + 1,
                      exercises: [{ exerciseId: '', order: 1, targetSets: 3 }],
                    });
                  }
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="np-start" className="text-sm font-medium text-(--text-h)">
              Start
            </label>
            <input
              id="np-start"
              type="datetime-local"
              className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base"
              {...form.register('startDate')}
            />
            {form.formState.errors.startDate?.message ? (
              <p className="text-sm text-red-600" role="alert">
                {form.formState.errors.startDate.message}
              </p>
            ) : (
              <p className="text-xs text-(--text)">Defaults to today; adjust if needed.</p>
            )}
          </div>
        </section>

        {workoutsFA.fields.map((wf, wi) => (
          <ProgramWorkoutBlock
            key={wf.id}
            wi={wi}
            form={form}
            onRemoveDay={() => workoutsFA.remove(wi)}
            canRemoveDay={workoutsFA.fields.length > 1}
          />
        ))}

        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            const len = workoutsFA.fields.length;
            workoutsFA.append({
              name: `Day ${len + 1}`,
              dayNumber: len + 1,
              exercises: [{ exerciseId: '', order: 1, targetSets: 3 }],
            });
            const newLen = len + 1;
            const dpw = form.getValues('daysPerWeek');
            const nextDpw = Math.max(dpw, newLen);
            form.setValue('daysPerWeek', nextDpw);
            form.setValue(
              'syncPattern',
              defaultSyncPattern(newLen, nextDpw) as CustomProgramForm['syncPattern'],
              { shouldDirty: true },
            );
          }}
        >
          Add workout day
        </Button>

        <ProgramScheduleFields form={form} />

        {form.formState.errors.workouts?.message ? (
          <p className="text-sm text-red-600" role="alert">
            {String(form.formState.errors.workouts.message)}
          </p>
        ) : null}
        {form.formState.errors.workouts?.root?.message ? (
          <p className="text-sm text-red-600" role="alert">
            {String(form.formState.errors.workouts.root.message)}
          </p>
        ) : null}

        {form.formState.errors.root?.message ||
        (mutation.isError ? errorMessageFromUnknown(mutation.error) : null) ? (
          <p className="text-sm text-red-600" role="alert">
            {form.formState.errors.root?.message ??
              (mutation.isError ? errorMessageFromUnknown(mutation.error) : undefined)}
          </p>
        ) : null}

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Create program'}
        </Button>
      </form>
      </div>
      {navigationLeavePrompt}
    </>
  );
}
