import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useFormState, useWatch, type Resolver } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/api/errors';
import { useConfirm } from '@/components/ConfirmProvider';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { Button } from '@/components/ui/button';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import { ExerciseIdSelect } from '@/features/exercises/components/ExerciseIdSelect';
import {
  API_VALIDATION_ERROR_CODE,
  applyApiValidationErrors,
} from '@/lib/applyApiValidationErrors';
import { useConfirmLeaveWhenDirty } from '@/hooks/useConfirmLeaveWhenDirty';
import { useNavigateBack } from '@/hooks/useNavigateBack';
import { errorMessageFromUnknown } from '@/lib/utils';
import {
  addProgramWorkout,
  addWorkoutExercise,
  bulkReorderWorkoutExercises,
  deleteProgram,
  deleteProgramWorkout,
  deleteWorkoutExercise,
  fetchProgramById,
  programQueryKeys,
  updateProgram,
  updateProgramWorkout,
  type UpdateProgramWorkoutBody,
  updateWorkoutExercise,
} from '../api';
import { ProgramScheduleFields } from '@/features/programs/components/ProgramScheduleFields';
import {
  formInputPatternToStoredPattern,
  programDetailToScheduleFormValues,
} from '@/features/programs/editScheduleFromProgram';
import {
  addExerciseSlotSchema,
  addWorkoutFormSchema,
  editExerciseSlotSchema,
  editProgramFormSchema,
  type AddExerciseSlotForm,
  type AddWorkoutForm,
  type EditExerciseSlotForm,
  type EditProgramForm,
} from '../schemas';
import type { ProgramWorkout, ProgramWorkoutExercise } from '../types';

export function ProgramEditPage() {
  const { id } = useParams<{ id: string }>();
  const programId = id ?? '';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const confirm = useConfirm();

  const query = useQuery({
    queryKey: programQueryKeys.detail(programId),
    queryFn: () => fetchProgramById(programId),
    enabled: Boolean(programId),
    staleTime: 1000 * 60,
  });

  const programForm = useForm<EditProgramForm>({
    resolver: zodResolver(editProgramFormSchema) as Resolver<EditProgramForm>,
    values: query.data
      ? (() => {
          const sched = programDetailToScheduleFormValues(query.data);
          return {
            name: query.data.name,
            description: query.data.description ?? '',
            difficulty: query.data.difficulty as EditProgramForm['difficulty'],
            goal: query.data.goal as EditProgramForm['goal'],
            splitType: query.data.splitType as EditProgramForm['splitType'],
            daysPerWeek: query.data.daysPerWeek,
            lengthWeeks: query.data.lengthWeeks ?? 8,
            status: query.data.status as EditProgramForm['status'],
            startDate: query.data.startDate ? formatForDatetimeLocal(query.data.startDate) : '',
            ...sched,
          };
        })()
      : undefined,
  });

  const { isDirty: programDetailsDirty } = useFormState({ control: programForm.control });
  const [prepareLeaveProgramForm, navigationLeavePrompt] =
    useConfirmLeaveWhenDirty(programDetailsDirty);
  const goBackToProgram = useNavigateBack(
    programId ? `/programs/${programId}` : '/programs',
  );

  const patchMeta = useMutation({
    mutationFn: (body: Parameters<typeof updateProgram>[1]) => updateProgram(programId, body),
  });

  const delProgram = useMutation({
    mutationFn: () => deleteProgram(programId),
  });

  const saveProgramDetails = useCallback(
    async (values: EditProgramForm) => {
      if (!query.data) return;
      const workoutsOrdered = [...query.data.programWorkouts].sort(
        (a, b) => (a.sequenceIndex ?? 0) - (b.sequenceIndex ?? 0) || a.dayNumber - b.dayNumber,
      );
      const dirty = programForm.formState.dirtyFields;
      const body: Parameters<typeof updateProgram>[1] = {};
      if (dirty.name) {
        const n = values.name?.trim();
        if (n) body.name = n;
      }
      if (dirty.description) body.description = values.description?.trim() || null;
      if (dirty.difficulty) body.difficulty = values.difficulty;
      if (dirty.goal) body.goal = values.goal;
      if (dirty.splitType) body.splitType = values.splitType;
      if (dirty.daysPerWeek) body.daysPerWeek = values.daysPerWeek;
      if (dirty.lengthWeeks) body.lengthWeeks = values.lengthWeeks;
      if (dirty.status) body.status = values.status;
      if (dirty.startDate && values.startDate?.trim()) {
        body.startDate = new Date(values.startDate).toISOString();
      }
      const scheduleDirty =
        Boolean(dirty.scheduleKind) ||
        Boolean(dirty.asyncPattern) ||
        Boolean(
          dirty.syncPattern && (Array.isArray(dirty.syncPattern) ? dirty.syncPattern.some(Boolean) : true),
        );
      if (scheduleDirty) {
        body.scheduleKind = values.scheduleKind;
        const pattern =
          values.scheduleKind === 'sync_week' ? values.syncPattern : values.asyncPattern;
        body.schedulePattern = formInputPatternToStoredPattern(
          pattern,
          workoutsOrdered.map((w) => w.id),
        );
      }
      if (scheduleDirty || dirty.lengthWeeks || dirty.startDate) {
        body.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
      if (Object.keys(body).length === 0) return;
      try {
        await patchMeta.mutateAsync(body);
        // Unblocks `useBlocker` before navigate: `isDirty` can still be true until the next render after `reset`.
        prepareLeaveProgramForm();
        qc.invalidateQueries({ queryKey: programQueryKeys.detail(programId) });
        qc.invalidateQueries({ queryKey: programQueryKeys.active() });
        qc.invalidateQueries({ queryKey: programQueryKeys.list() });
        programForm.reset(values);
        navigate('/programs', { replace: true });
      } catch (e) {
        if (e instanceof ApiError) {
          if (
            e.code === API_VALIDATION_ERROR_CODE &&
            applyApiValidationErrors(e, programForm.setError)
          ) {
            patchMeta.reset();
            return;
          }
          patchMeta.reset();
          programForm.setError('root', {
            type: 'server',
            message: e.message,
          });
          return;
        }
        patchMeta.reset();
        programForm.setError('root', {
          type: 'server',
          message: errorMessageFromUnknown(e),
        });
      }
    },
    [query.data, programForm, programId, patchMeta, qc, navigate, prepareLeaveProgramForm],
  );

  const onBackFromProgramEdit = useCallback(() => {
    if (!programDetailsDirty) {
      goBackToProgram();
      return;
    }
    void confirm('You have unsaved changes.', {
      cancelLabel: 'Keep editing',
      confirmLabel: 'Discard',
      extraLabel: 'Save changes',
    }).then((result) => {
      if (result === false) return;
      if (result === true) {
        prepareLeaveProgramForm();
        goBackToProgram();
        return;
      }
      void programForm.handleSubmit(saveProgramDetails)();
    });
  }, [
    programDetailsDirty,
    confirm,
    prepareLeaveProgramForm,
    goBackToProgram,
    programForm,
    saveProgramDetails,
  ]);

  if (!programId) {
    return (
      <>
        <SubpageHeader fallbackTo="/programs" title="Programs" backLabel="Back to programs" />
        <div className="mx-auto max-w-lg px-4 py-8">
          <p className="text-sm text-(--text)">Missing program id.</p>
        </div>
        {navigationLeavePrompt}
      </>
    );
  }

  if (query.isError) {
    return (
      <>
        <SubpageHeader
          fallbackTo={`/programs/${programId}`}
          title="Edit program"
          backLabel="Back to program"
        />
        <div className="mx-auto max-w-lg px-4 py-8">
          <QueryErrorMessage error={query.error} refetch={() => query.refetch()} />
        </div>
        {navigationLeavePrompt}
      </>
    );
  }

  if (query.isPending || !query.data) {
    return (
      <>
        <SubpageHeader
          fallbackTo={`/programs/${programId}`}
          title="Edit program"
          backLabel="Back to program"
        />
        <div className="mx-auto max-w-lg px-4 py-8">
          <p className="text-sm text-(--text)">Loading…</p>
        </div>
        {navigationLeavePrompt}
      </>
    );
  }

  const p = query.data;
  const workoutsOrdered = [...p.programWorkouts].sort(
    (a, b) => (a.sequenceIndex ?? 0) - (b.sequenceIndex ?? 0) || a.dayNumber - b.dayNumber,
  );
  const workoutNamesForSchedule = workoutsOrdered.map((w) => w.name);

  return (
    <>
      <SubpageHeader
        fallbackTo={`/programs/${programId}`}
        title={p.name}
        backLabel="Back to program"
        onBack={onBackFromProgramEdit}
      />
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
        <section className="rounded-xl border border-(--border) p-4">
          <h2 className="text-lg font-medium text-(--text-h)">Program details &amp; schedule</h2>
          <form
            className="mt-3 flex flex-col gap-3"
            onSubmit={programForm.handleSubmit(saveProgramDetails)}
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-(--text-h)">Name</label>
              <input
                className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base"
                {...programForm.register('name')}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-(--text-h)">Description</label>
              <textarea
                rows={2}
                className="rounded-lg border border-(--border) bg-(--bg) px-3 py-2 text-base"
                {...programForm.register('description')}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-(--text-h)">Status</label>
                <select
                  className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-2 text-base"
                  {...programForm.register('status')}
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-(--text-h)">Days / week</label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base"
                  {...programForm.register('daysPerWeek')}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-(--text-h)">Length (weeks)</label>
                <input
                  type="number"
                  min={1}
                  max={104}
                  className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base"
                  {...programForm.register('lengthWeeks', { valueAsNumber: true })}
                />
                <p className="text-xs text-(--text)">Changing length or start rebuilds planned days.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-(--text-h)">Difficulty</label>
                <select
                  className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-2 text-base"
                  {...programForm.register('difficulty')}
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
                  {...programForm.register('goal')}
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
                {...programForm.register('splitType')}
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
              <label className="text-sm font-medium text-(--text-h)">Start</label>
              <input
                type="datetime-local"
                className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base"
                {...programForm.register('startDate')}
              />
            </div>
            <p className="text-xs text-(--text)">
              Map each weekday to a workout or rest (same as creating a program). Workouts are
              ordered by sequence below. Changing schedule, length, or start rebuilds planned calendar
              days.
            </p>
            <ProgramScheduleFields
              form={programForm}
              workoutNames={workoutNamesForSchedule}
              includeLengthField={false}
            />
            {programForm.formState.errors.root?.message ||
            (patchMeta.isError ? errorMessageFromUnknown(patchMeta.error) : null) ? (
              <p className="text-sm text-red-600" role="alert">
                {programForm.formState.errors.root?.message ??
                  (patchMeta.isError ? errorMessageFromUnknown(patchMeta.error) : undefined)}
              </p>
            ) : null}
            <Button type="submit" disabled={patchMeta.isPending}>
              {patchMeta.isPending ? 'Saving…' : 'Save program'}
            </Button>
          </form>

          <div className="mt-4 border-t border-(--border) pt-4">
            <Button
              type="button"
              variant="secondary"
              className="border-red-600/50 text-red-700 hover:bg-red-500/10"
              disabled={delProgram.isPending}
              onClick={async () => {
                const ok = await confirm('Delete this program permanently?', {
                  confirmLabel: 'Delete',
                  cancelLabel: 'Cancel',
                });
                if (!ok) return;
                try {
                  await delProgram.mutateAsync();
                  prepareLeaveProgramForm();
                  qc.invalidateQueries({ queryKey: programQueryKeys.all });
                  navigate('/programs', { replace: true });
                } catch {
                  /* error surfaced via delProgram.isError */
                }
              }}
            >
              {delProgram.isPending ? 'Deleting…' : 'Delete program'}
            </Button>
            {delProgram.isError ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errorMessageFromUnknown(delProgram.error)}
              </p>
            ) : null}
          </div>
        </section>

        <AddWorkoutSection programId={programId} />

        <section className="flex flex-col gap-6">
          <h2 className="text-lg font-medium text-(--text-h)">Workouts</h2>
          {workoutsOrdered.map((w) => (
            <WorkoutCard
              key={w.id}
              programId={programId}
              workout={w}
              onConfirmRemoveDay={() =>
                confirm('Remove this workout day from the program?', {
                  confirmLabel: 'Remove',
                  cancelLabel: 'Cancel',
                }).then((r) => r === true)
              }
              onConfirmRemoveExercise={() =>
                confirm('Remove this exercise from the workout?', {
                  confirmLabel: 'Remove',
                  cancelLabel: 'Cancel',
                }).then((r) => r === true)
              }
            />
          ))}
        </section>
      </div>
      {navigationLeavePrompt}
    </>
  );
}

function formatForDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AddWorkoutSection({ programId }: { programId: string }) {
  const qc = useQueryClient();
  const form = useForm<AddWorkoutForm>({
    resolver: zodResolver(addWorkoutFormSchema) as Resolver<AddWorkoutForm>,
    defaultValues: { name: '', dayNumber: 1 },
  });
  const m = useMutation({
    mutationFn: (body: AddWorkoutForm) => addProgramWorkout(programId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: programQueryKeys.detail(programId) });
      qc.invalidateQueries({ queryKey: programQueryKeys.active() });
      form.reset({ name: '', dayNumber: 1 });
    },
  });

  return (
    <section className="rounded-xl border border-(--border) p-4">
      <h2 className="text-lg font-medium text-(--text-h)">Add workout day</h2>
      <form
        className="mt-3 flex flex-col gap-2"
        onSubmit={form.handleSubmit(async (v) => {
          try {
            await m.mutateAsync(v);
          } catch (e) {
            if (e instanceof ApiError) {
              if (
                e.code === API_VALIDATION_ERROR_CODE &&
                applyApiValidationErrors(e, form.setError)
              ) {
                m.reset();
                return;
              }
              m.reset();
              form.setError('root', { type: 'server', message: e.message });
              return;
            }
            m.reset();
            form.setError('root', {
              type: 'server',
              message: errorMessageFromUnknown(e),
            });
          }
        })}
      >
        <div className="flex flex-col gap-1">
          <label
            className="text-sm font-medium text-(--text-h)"
            htmlFor={`add-w-name-${programId}`}
          >
            Workout name
          </label>
          <input
            id={`add-w-name-${programId}`}
            placeholder="e.g. Push day"
            className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base"
            {...form.register('name')}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-(--text-h)" htmlFor={`add-w-day-${programId}`}>
            Day number (1–14)
          </label>
          <p className="text-xs text-(--text)">
            Which day slot this workout uses in the program (1 = first day).
          </p>
          <input
            id={`add-w-day-${programId}`}
            type="number"
            min={1}
            max={14}
            aria-label="Day number from 1 to 14"
            className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base"
            {...form.register('dayNumber')}
          />
        </div>
        {form.formState.errors.root?.message ||
        (m.isError ? errorMessageFromUnknown(m.error) : null) ? (
          <p className="text-sm text-red-600" role="alert">
            {form.formState.errors.root?.message ??
              (m.isError ? errorMessageFromUnknown(m.error) : undefined)}
          </p>
        ) : null}
        <Button type="submit" disabled={m.isPending} variant="secondary">
          {m.isPending ? 'Adding…' : 'Add workout'}
        </Button>
      </form>
    </section>
  );
}

function WorkoutCard({
  programId,
  workout: w,
  onConfirmRemoveDay,
  onConfirmRemoveExercise,
}: {
  programId: string;
  workout: ProgramWorkout;
  onConfirmRemoveDay: () => Promise<boolean>;
  onConfirmRemoveExercise: () => Promise<boolean>;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const wf = useForm<AddWorkoutForm>({
    resolver: zodResolver(addWorkoutFormSchema) as Resolver<AddWorkoutForm>,
    values: { name: w.name, dayNumber: w.dayNumber },
  });

  const patchW = useMutation({
    mutationFn: async (data: AddWorkoutForm) => {
      const name = data.name.trim();
      const body: UpdateProgramWorkoutBody = {};
      if (name !== w.name) body.name = name;
      if (data.dayNumber !== w.dayNumber) body.dayNumber = data.dayNumber;
      if (Object.keys(body).length === 0) return;
      await updateProgramWorkout(programId, w.id, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: programQueryKeys.detail(programId) });
      setEditing(false);
    },
  });

  const delW = useMutation({
    mutationFn: () => deleteProgramWorkout(programId, w.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: programQueryKeys.detail(programId) });
      qc.invalidateQueries({ queryKey: programQueryKeys.active() });
    },
  });

  const exercises = [...w.programWorkoutExercises].sort((a, b) => a.order - b.order);

  const reorder = useMutation({
    mutationFn: async (next: typeof exercises) => {
      const payload = next.map((row, i) => ({ id: row.id, order: i + 1 }));
      await bulkReorderWorkoutExercises(programId, w.id, { exercises: payload });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: programQueryKeys.detail(programId) });
    },
  });

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= exercises.length) return;
    const next = [...exercises];
    const t = next[index];
    const u = next[j];
    next[index] = u;
    next[j] = t;
    void reorder.mutateAsync(next).catch((e) => {
      if (e instanceof ApiError) reorder.reset();
    });
  };

  return (
    <div className="rounded-xl border border-(--border) bg-(--bg) p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        {editing ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-(--text-h)" htmlFor={`wd-name-${w.id}`}>
                Workout name
              </label>
              <input
                id={`wd-name-${w.id}`}
                className="min-h-10 rounded border border-(--border) px-2 text-base"
                {...wf.register('name')}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-(--text-h)" htmlFor={`wd-day-${w.id}`}>
                Day number (1–14)
              </label>
              <p className="text-xs text-(--text)">Position of this day in your program week.</p>
              <input
                id={`wd-day-${w.id}`}
                type="number"
                min={1}
                max={14}
                className="min-h-10 rounded border border-(--border) px-2 text-base"
                {...wf.register('dayNumber', { valueAsNumber: true })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                disabled={patchW.isPending}
                onClick={() =>
                  void wf.handleSubmit(async (data) => {
                    try {
                      await patchW.mutateAsync(data);
                    } catch (e) {
                      if (e instanceof ApiError) {
                        if (
                          e.code === API_VALIDATION_ERROR_CODE &&
                          applyApiValidationErrors(e, wf.setError)
                        ) {
                          patchW.reset();
                          return;
                        }
                        patchW.reset();
                        wf.setError('root', {
                          type: 'server',
                          message: e.message,
                        });
                        return;
                      }
                      patchW.reset();
                      wf.setError('root', {
                        type: 'server',
                        message: errorMessageFromUnknown(e),
                      });
                    }
                  })()
                }
              >
                Save
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
            {wf.formState.errors.root?.message ||
            (patchW.isError ? errorMessageFromUnknown(patchW.error) : null) ? (
              <p className="text-xs text-red-600" role="alert">
                {wf.formState.errors.root?.message ??
                  (patchW.isError ? errorMessageFromUnknown(patchW.error) : undefined)}
              </p>
            ) : null}
          </div>
        ) : (
          <h3 className="font-medium text-(--text-h)">
            Day {w.dayNumber}: {w.name}
          </h3>
        )}
        <div className="flex flex-wrap gap-2">
          {!editing ? (
            <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
              Edit day
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            disabled={delW.isPending}
            onClick={async () => {
              const ok = await onConfirmRemoveDay();
              if (ok) delW.mutate();
            }}
          >
            Remove day
          </Button>
        </div>
      </div>

      {reorder.isError ? (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {errorMessageFromUnknown(reorder.error)}
        </p>
      ) : null}

      <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm text-(--text)">
        {exercises.map((slot, idx) => (
          <li key={slot.id} className="rounded-lg border border-(--border) p-3">
            <ExerciseSlotRow
              programId={programId}
              workoutId={w.id}
              slot={slot}
              index={idx}
              total={exercises.length}
              onMoveUp={() => move(idx, -1)}
              onMoveDown={() => move(idx, 1)}
              reorderBusy={reorder.isPending}
              onConfirmRemoveExercise={onConfirmRemoveExercise}
            />
          </li>
        ))}
      </ol>

      <AddExerciseToWorkout
        programId={programId}
        workoutId={w.id}
        nextOrder={exercises.length + 1}
      />
    </div>
  );
}

function ExerciseSlotRow({
  programId,
  workoutId,
  slot,
  index,
  total,
  onMoveUp,
  onMoveDown,
  reorderBusy,
  onConfirmRemoveExercise,
}: {
  programId: string;
  workoutId: string;
  slot: ProgramWorkoutExercise;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  reorderBusy: boolean;
  onConfirmRemoveExercise: () => Promise<boolean>;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const f = useForm<EditExerciseSlotForm>({
    resolver: zodResolver(editExerciseSlotSchema) as Resolver<EditExerciseSlotForm>,
    values: {
      order: slot.order,
      targetSets: slot.targetSets,
      targetWeight: slot.targetWeight ?? undefined,
      targetTopSetReps: slot.targetTopSetReps ?? undefined,
      targetTotalReps: slot.targetTotalReps ?? undefined,
      targetRir: slot.targetRir ?? undefined,
    },
  });

  const patch = useMutation({
    mutationFn: async (data: EditExerciseSlotForm) => {
      await updateWorkoutExercise(programId, workoutId, slot.id, {
        order: data.order ?? slot.order,
        targetSets: data.targetSets ?? slot.targetSets,
        targetWeight: data.targetWeight ?? null,
        targetTopSetReps: data.targetTopSetReps ?? null,
        targetTotalReps: data.targetTotalReps ?? null,
        targetRir: data.targetRir ?? null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: programQueryKeys.detail(programId) });
      setEditing(false);
    },
  });

  const del = useMutation({
    mutationFn: () => deleteWorkoutExercise(programId, workoutId, slot.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: programQueryKeys.detail(programId) }),
  });

  const exerciseTitle = slot.exercise?.name ?? 'Exercise';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          to={`/exercises/${slot.exerciseId}`}
          className="font-medium text-(--accent) underline-offset-2 hover:underline"
        >
          {exerciseTitle}
        </Link>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="secondary"
            className="min-h-9 px-2 text-xs"
            disabled={index === 0 || reorderBusy}
            onClick={onMoveUp}
          >
            Up
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-9 px-2 text-xs"
            disabled={index === total - 1 || reorderBusy}
            onClick={onMoveDown}
          >
            Down
          </Button>
        </div>
      </div>
      {editing ? (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Order"
            className="min-h-9 rounded border px-2"
            {...f.register('order')}
          />
          <input
            type="number"
            placeholder="Sets"
            className="min-h-9 rounded border px-2"
            {...f.register('targetSets')}
          />
          <input
            type="number"
            placeholder="Target weight"
            className="min-h-9 rounded border px-2"
            {...f.register('targetWeight')}
          />
          <input
            type="number"
            placeholder="Top set reps"
            className="min-h-9 rounded border px-2"
            {...f.register('targetTopSetReps')}
          />
          <input
            type="number"
            placeholder="Total reps"
            className="min-h-9 rounded border px-2"
            {...f.register('targetTotalReps')}
          />
          <input
            type="number"
            placeholder="RIR"
            className="min-h-9 rounded border px-2"
            {...f.register('targetRir')}
          />
          <Button
            type="button"
            disabled={patch.isPending}
            onClick={() =>
              void f.handleSubmit(async (data) => {
                try {
                  await patch.mutateAsync(data);
                } catch (e) {
                  if (e instanceof ApiError) {
                    if (
                      e.code === API_VALIDATION_ERROR_CODE &&
                      applyApiValidationErrors(e, f.setError)
                    ) {
                      patch.reset();
                      return;
                    }
                    patch.reset();
                    f.setError('root', {
                      type: 'server',
                      message: e.message,
                    });
                    return;
                  }
                  patch.reset();
                  f.setError('root', {
                    type: 'server',
                    message: errorMessageFromUnknown(e),
                  });
                }
              })()
            }
          >
            Save
          </Button>
          <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <p>
          {slot.targetSets} sets
          {slot.targetWeight != null ? ` · target ${slot.targetWeight}` : ''}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {!editing ? (
          <Button
            type="button"
            variant="secondary"
            className="min-h-9 text-xs"
            onClick={() => setEditing(true)}
          >
            Edit targets
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          className="min-h-9 text-xs"
          disabled={del.isPending}
          onClick={async () => {
            const ok = await onConfirmRemoveExercise();
            if (ok) del.mutate();
          }}
        >
          Remove
        </Button>
      </div>
      {f.formState.errors.root?.message ||
      (patch.isError ? errorMessageFromUnknown(patch.error) : null) ? (
        <p className="text-xs text-red-600" role="alert">
          {f.formState.errors.root?.message ??
            (patch.isError ? errorMessageFromUnknown(patch.error) : undefined)}
        </p>
      ) : null}
    </div>
  );
}

function AddExerciseToWorkout({
  programId,
  workoutId,
  nextOrder,
}: {
  programId: string;
  workoutId: string;
  nextOrder: number;
}) {
  const qc = useQueryClient();
  const form = useForm<AddExerciseSlotForm>({
    resolver: zodResolver(addExerciseSlotSchema) as Resolver<AddExerciseSlotForm>,
    defaultValues: {
      exerciseId: '',
      order: nextOrder,
      targetSets: 3,
    },
  });

  useEffect(() => {
    form.reset({
      exerciseId: '',
      order: nextOrder,
      targetSets: 3,
    });
  }, [nextOrder, workoutId, form]);

  const m = useMutation({
    mutationFn: (body: AddExerciseSlotForm) =>
      addWorkoutExercise(programId, workoutId, {
        exerciseId: body.exerciseId,
        order: body.order,
        targetSets: body.targetSets,
        targetWeight: body.targetWeight,
        targetTotalReps: body.targetTotalReps,
        targetTopSetReps: body.targetTopSetReps,
        targetRir: body.targetRir,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: programQueryKeys.detail(programId) });
    },
  });

  const exerciseIdValue = useWatch({
    control: form.control,
    name: 'exerciseId',
    defaultValue: '',
  });

  return (
    <div className="mt-3 rounded-lg border border-dashed border-(--border) p-3">
      <p className="mb-2 text-sm font-medium text-(--text-h)">Add exercise</p>
      <form
        className="flex flex-col gap-2"
        onSubmit={form.handleSubmit(async (v) => {
          try {
            await m.mutateAsync(v);
          } catch (e) {
            if (e instanceof ApiError) {
              if (
                e.code === API_VALIDATION_ERROR_CODE &&
                applyApiValidationErrors(e, form.setError)
              ) {
                m.reset();
                return;
              }
              m.reset();
              form.setError('root', { type: 'server', message: e.message });
              return;
            }
            m.reset();
            form.setError('root', {
              type: 'server',
              message: errorMessageFromUnknown(e),
            });
          }
        })}
      >
        <ExerciseIdSelect
          id={`add-ex-${workoutId}`}
          value={exerciseIdValue ?? ''}
          onChange={(id) => form.setValue('exerciseId', id)}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            className="min-h-10 rounded border px-2"
            placeholder="Order"
            {...form.register('order')}
          />
          <input
            type="number"
            className="min-h-10 rounded border px-2"
            placeholder="Sets"
            {...form.register('targetSets')}
          />
        </div>
        {form.formState.errors.root?.message ||
        (m.isError ? errorMessageFromUnknown(m.error) : null) ? (
          <p className="text-xs text-red-600" role="alert">
            {form.formState.errors.root?.message ??
              (m.isError ? errorMessageFromUnknown(m.error) : undefined)}
          </p>
        ) : null}
        <Button type="submit" variant="secondary" disabled={m.isPending}>
          {m.isPending ? 'Adding…' : 'Add to workout'}
        </Button>
      </form>
    </div>
  );
}
