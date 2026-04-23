import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  useFieldArray,
  useForm,
  useFormState,
  useWatch,
  type Control,
  type Resolver,
  type UseFormGetValues,
  type UseFormReturn,
} from 'react-hook-form';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError } from '@/api/errors';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { Button } from '@/components/ui/button';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import {
  API_VALIDATION_ERROR_CODE,
  applyApiValidationErrors,
} from '@/lib/applyApiValidationErrors';
import { errorMessageFromUnknown } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmProvider';
import { useAuth } from '@/features/auth/useAuth';
import { useConfirmLeaveWhenDirty } from '@/hooks/useConfirmLeaveWhenDirty';
import { exercisePerformanceQueryKeys } from '@/features/exercise-performance/api';
import { programQueryKeys, fetchProgramById } from '@/features/programs/api';
import {
  PartialLogSessionDialog,
  type PartialLogSessionChoice,
} from '../components/PartialLogSessionDialog';
import { AddSessionExerciseDialog } from '../components/AddSessionExerciseDialog';
import { SessionExerciseEditor } from '../components/SessionExerciseEditor';
import {
  classifyLogSessionCompletion,
  pruneLogSessionToCompletedSetsOnly,
} from '../logSessionSubmitHelpers';
import { defaultSets } from '../sessionFormDefaults';
import { createSession, fetchGeneratedTargets, sessionQueryKeys } from '../api';
import { readLiveSessionDraft, writeLiveSessionDraft } from '../liveSessionDraftStorage';
import { triggerWorkoutGeneration } from '../triggerWorkoutGeneration';
import { useLiveSessionChrome } from '../liveSessionChromeContext';
import { useLiveSession } from '../useLiveSession';
import { deriveSessionStatusFromSets, logSessionFormSchema, type LogSessionForm } from '../schemas';
import { formatDateKeyForDisplay, isValidDateKey, localDateKey } from '../sessionCalendarUtils';

function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

function toDatetimeLocalValue(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function renumberExerciseOrders(
  form: UseFormReturn<LogSessionForm, unknown, LogSessionForm>,
  len: number,
) {
  for (let i = 0; i < len; i++) {
    form.setValue(`exercises.${i}.order`, i + 1);
  }
}

/**
 * Isolated `useWatch` + debounced draft write so the rest of the page does not re-render
 * on every form edit (replaces RHF `watch()` which trips react-hooks/incompatible-library).
 */
function LiveSessionDraftSync({
  control,
  getValues,
  hasSession,
  userId,
  programId,
  programWorkoutId,
  draftPersistenceEnabled,
  sessionStartedAt,
}: {
  control: Control<LogSessionForm>;
  getValues: UseFormGetValues<LogSessionForm>;
  hasSession: boolean;
  userId: string;
  programId: string;
  programWorkoutId: string;
  draftPersistenceEnabled: boolean;
  sessionStartedAt: number | null;
}) {
  const watched = useWatch({ control });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionStartedForWriteRef = useRef(sessionStartedAt);

  useLayoutEffect(() => {
    sessionStartedForWriteRef.current = sessionStartedAt;
  }, [sessionStartedAt]);

  useEffect(() => {
    if (!hasSession || !userId) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      return;
    }
    if (!draftPersistenceEnabled) {
      return;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      const started = sessionStartedForWriteRef.current;
      if (started == null) {
        return;
      }
      writeLiveSessionDraft({
        userId,
        programId,
        programWorkoutId,
        sessionStartedAt: started,
        form: getValues(),
      });
    }, 300);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [
    watched,
    hasSession,
    userId,
    programId,
    programWorkoutId,
    getValues,
    draftPersistenceEnabled,
    sessionStartedAt,
  ]);

  return null;
}

export function LogSessionPage() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const initKeyRef = useRef<string | null>(null);
  const [draftPersistenceEnabled, setDraftPersistenceEnabled] = useState(false);
  const sessionStartedAtRef = useRef<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const gearDialogRef = useRef<HTMLDialogElement>(null);
  const addExerciseDialogRef = useRef<HTMLDialogElement>(null);
  const gearTitleId = useId();
  const [addExerciseReset, setAddExerciseReset] = useState(0);
  const [addExerciseDefaultIndex, setAddExerciseDefaultIndex] = useState(0);
  const partialChoiceRef = useRef<((choice: PartialLogSessionChoice) => void) | null>(null);
  const [partialDialogOpen, setPartialDialogOpen] = useState(false);

  const [search] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { setLiveSession, clearLiveSession } = useLiveSession();
  const { setChrome } = useLiveSessionChrome();
  const confirm = useConfirm();

  const programIdParam = search.get('programId') ?? '';
  const workoutIdParam = search.get('programWorkoutId') ?? '';
  const occurrenceIdParam = search.get('occurrenceId') ?? '';
  const scheduledOnParamRaw = search.get('scheduledOn');
  const scheduledOnParam = isValidDateKey(scheduledOnParamRaw) ? scheduledOnParamRaw : '';
  const hasSessionParams = Boolean(programIdParam && workoutIdParam);

  useEffect(() => {
    if (!hasSessionParams) return;
    setLiveSession({
      programId: programIdParam,
      programWorkoutId: workoutIdParam,
    });
  }, [hasSessionParams, programIdParam, workoutIdParam, setLiveSession]);

  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [pausedAt, setPausedAt] = useState<number | null>(null);

  useEffect(() => {
    sessionStartedAtRef.current = sessionStartedAt;
  }, [sessionStartedAt]);

  useEffect(() => {
    if (sessionStartedAt == null || pausedAt != null) return;
    setNowMs(Date.now());
    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, [sessionStartedAt, pausedAt]);

  const elapsedSeconds =
    sessionStartedAt != null
      ? Math.min(Math.floor((nowMs - sessionStartedAt) / 1000), 600 * 60)
      : 0;

  const programQ = useQuery({
    queryKey: programQueryKeys.detail(programIdParam),
    queryFn: () => fetchProgramById(programIdParam),
    enabled: hasSessionParams,
  });

  const generatedTargetsQ = useQuery({
    queryKey: sessionQueryKeys.generatedTargets(workoutIdParam),
    queryFn: () => fetchGeneratedTargets(workoutIdParam),
    enabled: hasSessionParams && !!workoutIdParam,
    retry: false,
  });

  const form = useForm<LogSessionForm>({
    resolver: zodResolver(logSessionFormSchema) as Resolver<LogSessionForm>,
    defaultValues: {
      programId: programIdParam,
      programWorkoutId: workoutIdParam,
      workoutName: '',
      dayNumber: 1,
      sessionStatus: 'completed',
      exercises: [],
    },
  });

  const { isDirty } = useFormState({ control: form.control });
  /** Draft is persisted; SPA blocking would prompt on every navigation despite safe browse-away. */
  const [prepareLeave, navigationLeavePrompt] = useConfirmLeaveWhenDirty(isDirty, {
    blockSpaNavigation: !draftPersistenceEnabled,
  });

  const workoutName = useWatch({ control: form.control, name: 'workoutName' });
  const dayNumber = useWatch({ control: form.control, name: 'dayNumber' });

  const watchedExercises = useWatch({ control: form.control, name: 'exercises' });
  const addExercisePositionLabels = useMemo(
    () =>
      (watchedExercises ?? []).map((ex, i) =>
        ex.exerciseName?.trim() ? ex.exerciseName.trim() : `Exercise ${i + 1}`,
      ),
    [watchedExercises],
  );

  const completingWorkoutName = useMemo(() => {
    const w = workoutName?.trim();
    if (w) return w;
    const pw = programQ.data?.programWorkouts.find((x) => x.id === workoutIdParam);
    return pw?.name ?? '';
  }, [workoutName, programQ.data, workoutIdParam]);

  const generatedTargetsSettled = !generatedTargetsQ.isPending;

  useEffect(() => {
    if (!programQ.data || !workoutIdParam || !userId) {
      if (programIdParam) form.setValue('programId', programIdParam);
      if (workoutIdParam) form.setValue('programWorkoutId', workoutIdParam);
      return;
    }
    const w = programQ.data.programWorkouts.find((x) => x.id === workoutIdParam);
    if (!w) return;

    const draft = readLiveSessionDraft(userId, programIdParam, workoutIdParam);

    if (!draft && !generatedTargetsSettled) return;

    const currentKey = `${userId}:${programIdParam}:${workoutIdParam}`;
    if (initKeyRef.current === currentKey) {
      return;
    }

    setDraftPersistenceEnabled(false);
    const rows = [...w.programWorkoutExercises].sort((a, b) => a.order - b.order);

    if (draft) {
      form.reset(draft.form);
      const t = draft.sessionStartedAt;
      setSessionStartedAt(t);
      setNowMs(Date.now());
      sessionStartedAtRef.current = t;
      setPausedAt(null);
    } else {
      const generated = generatedTargetsQ.data;
      const genByExercise = new Map(generated?.exercises.map((e) => [e.exerciseId, e]) ?? []);

      const startedAt = Date.now();
      form.reset({
        programId: programQ.data.id,
        programWorkoutId: workoutIdParam,
        workoutName: w.name,
        dayNumber: w.dayNumber,
        sessionStatus: 'completed',
        exercises: rows.map((slot) => {
          const gen = genByExercise.get(slot.exerciseId);
          if (gen) {
            return {
              exerciseId: slot.exerciseId,
              exerciseName: slot.exercise?.name,
              order: slot.order,
              targetSets: gen.targetSets,
              targetWeight: slot.targetWeight ?? undefined,
              targetTotalReps: slot.targetTotalReps ?? undefined,
              targetTopSetReps: slot.targetTopSetReps ?? undefined,
              targetRir: gen.targetRir ?? slot.targetRir ?? undefined,
              sets: gen.sets.map((s) => ({
                targetWeight: s.targetWeight != null ? Math.round(s.targetWeight) : undefined,
                targetReps: s.targetReps ?? undefined,
                reps: 0,
                weight: 0,
                rir: undefined,
                setCompleted: false,
              })),
            };
          }
          return {
            exerciseId: slot.exerciseId,
            exerciseName: slot.exercise?.name,
            order: slot.order,
            targetSets: slot.targetSets,
            targetWeight: slot.targetWeight ?? undefined,
            targetTotalReps: slot.targetTotalReps ?? undefined,
            targetTopSetReps: slot.targetTopSetReps ?? undefined,
            targetRir: slot.targetRir ?? undefined,
            sets: defaultSets(
              slot.targetSets,
              slot.targetWeight != null ? Math.round(slot.targetWeight) : null,
              slot.targetTopSetReps,
            ),
          };
        }),
      });
      setSessionStartedAt(startedAt);
      setNowMs(startedAt);
      sessionStartedAtRef.current = startedAt;
      setPausedAt(null);
    }

    initKeyRef.current = currentKey;
    queueMicrotask(() => {
      setDraftPersistenceEnabled(true);
    });
  }, [
    programQ.data,
    workoutIdParam,
    programIdParam,
    userId,
    form,
    generatedTargetsSettled,
    generatedTargetsQ.data,
  ]);

  useEffect(() => {
    if (!hasSessionParams) return;
    document.documentElement.dataset.liveSession = 'true';
    return () => {
      delete document.documentElement.dataset.liveSession;
    };
  }, [hasSessionParams]);

  const exercisesFA = useFieldArray({
    control: form.control,
    name: 'exercises',
  });

  const renumberAll = () => {
    const len = form.getValues('exercises').length;
    renumberExerciseOrders(form, len);
  };

  const openAddExerciseDialog = () => {
    setAddExerciseDefaultIndex(exercisesFA.fields.length);
    setAddExerciseReset((n) => n + 1);
    setTimeout(() => {
      addExerciseDialogRef.current?.showModal();
    }, 0);
  };

  const onOpenReorder = useCallback(() => {
    if (sessionStartedAt == null || !userId) return;
    writeLiveSessionDraft({
      userId,
      programId: programIdParam,
      programWorkoutId: workoutIdParam,
      sessionStartedAt,
      form: form.getValues(),
    });
    const p = new URLSearchParams();
    p.set('programId', programIdParam);
    p.set('programWorkoutId', workoutIdParam);
    if (occurrenceIdParam) p.set('occurrenceId', occurrenceIdParam);
    if (scheduledOnParam) p.set('scheduledOn', scheduledOnParam);
    navigate({ pathname: '/sessions/new/reorder-exercises', search: `?${p.toString()}` });
  }, [
    sessionStartedAt,
    userId,
    programIdParam,
    workoutIdParam,
    occurrenceIdParam,
    scheduledOnParam,
    form,
    navigate,
  ]);

  const mutation = useMutation({
    mutationFn: createSession,
    onSuccess: (session) => {
      prepareLeave();
      clearLiveSession();
      triggerWorkoutGeneration(session.id);
      qc.invalidateQueries({ queryKey: sessionQueryKeys.all });
      qc.invalidateQueries({ queryKey: programQueryKeys.all });
      qc.invalidateQueries({ queryKey: programQueryKeys.active() });
      qc.invalidateQueries({ queryKey: exercisePerformanceQueryKeys.all });
      const name =
        session.workoutName?.trim() ||
        (session.programWorkoutId
          ? programQ.data?.programWorkouts.find((w) => w.id === session.programWorkoutId)?.name
          : undefined) ||
        session.workoutName;
      const scheduleLabel = scheduledOnParam ? formatDateKeyForDisplay(scheduledOnParam) : null;
      const backlogAck =
        occurrenceIdParam && programQ.data
          ? {
              scheduleLabel,
              workoutName: name,
              programId: programIdParam,
              programName: programQ.data.name,
            }
          : undefined;
      navigate(`/sessions/${session.id}`, {
        state: backlogAck ? { backlogAck } : undefined,
      });
    },
  });

  const workoutMissing =
    programQ.data &&
    workoutIdParam &&
    !programQ.data.programWorkouts.some((x) => x.id === workoutIdParam);

  const canShowLiveSessionUi = hasSessionParams && !programQ.isError && !workoutMissing;

  const onQuit = useCallback(() => {
    void confirm('Leave without saving? Anything on this screen will be lost.', {
      confirmLabel: 'Leave',
      cancelLabel: 'Stay',
    }).then((ok) => {
      if (!ok) return;
      prepareLeave();
      clearLiveSession();
      navigate('/sessions');
    });
  }, [clearLiveSession, confirm, navigate, prepareLeave]);

  const onPauseToggle = useCallback(() => {
    if (sessionStartedAt == null) return;
    if (pausedAt == null) {
      setPausedAt(Date.now());
    } else {
      const gap = Date.now() - pausedAt;
      setSessionStartedAt((s) => (s != null ? s + gap : s));
      setPausedAt(null);
      setNowMs(Date.now());
    }
  }, [sessionStartedAt, pausedAt]);

  const onOpenGear = useCallback(() => {
    gearDialogRef.current?.showModal();
  }, []);

  const onComplete = useCallback(() => {
    formRef.current?.requestSubmit();
  }, []);

  const resolvePartialChoice = useCallback((choice: PartialLogSessionChoice) => {
    setPartialDialogOpen(false);
    const r = partialChoiceRef.current;
    partialChoiceRef.current = null;
    r?.(choice);
  }, []);

  const askPartialChoice = useCallback((): Promise<PartialLogSessionChoice> => {
    return new Promise((resolve) => {
      partialChoiceRef.current = resolve;
      setPartialDialogOpen(true);
    });
  }, []);

  useEffect(() => {
    if (!canShowLiveSessionUi) {
      setChrome(null);
      return;
    }
    const workoutTitleLine = programQ.isPending
      ? 'Loading…'
      : workoutName?.trim()
        ? `Day ${dayNumber}: ${workoutName.trim()}`
        : 'Workout';

    setChrome({
      workoutTitleLine,
      elapsedLabel: sessionStartedAt != null ? formatElapsed(elapsedSeconds) : '—',
      isPaused: pausedAt != null,
      onQuit,
      onPauseToggle,
      onOpenGear,
      onComplete,
      completeDisabled: mutation.isPending || exercisesFA.fields.length === 0,
    });
    return () => setChrome(null);
  }, [
    canShowLiveSessionUi,
    sessionStartedAt,
    elapsedSeconds,
    pausedAt,
    onQuit,
    onPauseToggle,
    onOpenGear,
    onComplete,
    mutation.isPending,
    exercisesFA.fields.length,
    setChrome,
    programQ.isPending,
    workoutName,
    dayNumber,
  ]);

  if (!hasSessionParams) {
    return <Navigate to="/sessions/start" replace />;
  }

  if (programIdParam && programQ.isError) {
    return (
      <>
        <SubpageHeader fallbackTo="/programs" title="Programs" backLabel="Back to programs" />
        <div className="mx-auto max-w-lg px-4 py-8">
          <QueryErrorMessage error={programQ.error} refetch={() => programQ.refetch()} />
        </div>
      </>
    );
  }

  if (workoutMissing) {
    return (
      <>
        <SubpageHeader
          fallbackTo="/sessions/start"
          title="Log session"
          backLabel="Choose a workout"
        />
        <div className="mx-auto max-w-lg px-4 py-8">
          <p className="text-sm text-(--text)">This workout is not part of that program.</p>
        </div>
      </>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8 px-4 py-5 sm:px-5 sm:py-8">
      <LiveSessionDraftSync
        control={form.control}
        getValues={form.getValues}
        hasSession={hasSessionParams}
        userId={userId}
        programId={programIdParam}
        programWorkoutId={workoutIdParam}
        draftPersistenceEnabled={draftPersistenceEnabled}
        sessionStartedAt={sessionStartedAt}
      />
      {hasSessionParams && occurrenceIdParam ? (
        <section
          className="rounded-xl border border-(--accent-border) bg-(--accent-bg) px-4 py-3 text-sm"
          aria-live="polite"
        >
          <p className="font-medium text-(--text-h)">
            Completing: {completingWorkoutName || 'Workout'}
            {scheduledOnParam ? ` · scheduled ${formatDateKeyForDisplay(scheduledOnParam)}` : null}
          </p>
          <p className="mt-2 text-(--text)">
            Saving will mark that planned day complete and move your program forward (this clears
            one item from your backlog).
          </p>
        </section>
      ) : null}

      <form
        ref={formRef}
        className="flex flex-col gap-8"
        // RHF: handleSubmit does not read `formRef` — `react-hooks/refs` false positive on the same <form> node.
        // eslint-disable-next-line react-hooks/refs
        onSubmit={form.handleSubmit(async (values) => {
          const outcome = classifyLogSessionCompletion(values.exercises);
          let payload: LogSessionForm = values;

          if (outcome.kind === 'complete') {
            const ok = await confirm('Save this workout and finish?', {
              confirmLabel: 'Save',
              cancelLabel: 'Not now',
            });
            if (!ok) return;
          } else if (outcome.kind === 'empty') {
            const emptyMsg =
              outcome.emptyDetail === 'unmarked'
                ? 'No sets are marked complete. Save this session anyway?'
                : 'Nothing logged yet. Save this session anyway?';
            const ok = await confirm(emptyMsg, {
              confirmLabel: 'Save anyway',
              cancelLabel: 'Go back',
            });
            if (!ok) return;
          } else {
            const choice = await askPartialChoice();
            if (choice === 'back') return;
            if (choice === 'prune') {
              payload = pruneLogSessionToCompletedSetsOnly(values);
              if (payload.exercises.length === 0) {
                await confirm(
                  'That would remove everything — no set has both reps and weight entered. Log at least one full set, or save as entered.',
                  { confirmLabel: 'OK', singleButton: true },
                );
                return;
              }
            }
          }

          const sessionStatus = deriveSessionStatusFromSets(payload.exercises);
          const elapsedMin =
            sessionStartedAt != null ? Math.min(600, (nowMs - sessionStartedAt) / 60000) : 0;
          try {
            await mutation.mutateAsync({
              programId: payload.programId,
              programWorkoutId: payload.programWorkoutId,
              workoutName: payload.workoutName.trim(),
              dayNumber: payload.dayNumber,
              sessionStatus,
              sessionDuration: elapsedMin,
              ...(occurrenceIdParam ? { occurrenceId: occurrenceIdParam } : {}),
              datePerformed: new Date().toISOString(),
              performedOnLocalDate: localDateKey(new Date()),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              exercises: payload.exercises.map((ex) => ({
                exerciseId: ex.exerciseId,
                order: ex.order,
                targetSets: ex.sets.length,
                targetWeight: ex.targetWeight,
                targetTotalReps: ex.targetTotalReps,
                targetTopSetReps: ex.targetTopSetReps,
                targetRir: ex.targetRir,
                sets: ex.sets.map((s) => ({
                  targetWeight: s.targetWeight,
                  targetReps: s.targetReps,
                  reps: s.reps,
                  weight: s.weight,
                  rir: s.rir ?? 0,
                  setCompleted: s.setCompleted,
                })),
              })),
            });
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
        <input type="hidden" {...form.register('programId')} />
        <input type="hidden" {...form.register('programWorkoutId')} />
        <input type="hidden" {...form.register('dayNumber')} />
        <input type="hidden" {...form.register('sessionStatus')} />

        <dialog
          ref={gearDialogRef}
          className="fixed top-1/2 left-1/2 z-50 w-[min(100%-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-(--border) bg-(--bg) p-4 shadow-(--shadow)"
          aria-labelledby={gearTitleId}
        >
          <h2 id={gearTitleId} className="text-base font-medium text-(--text-h)">
            Session details
          </h2>
          <p className="mt-1 text-xs text-(--text)">
            Adjust how this workout is labeled and when the timer started. Notes and server date
            overrides can be added later.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium text-(--text-h)">
              Workout name
              <input
                type="text"
                maxLength={35}
                className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base text-(--text)"
                {...form.register('workoutName')}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-(--text-h)">
              Timer start
              <input
                type="datetime-local"
                className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base text-(--text)"
                value={sessionStartedAt != null ? toDatetimeLocalValue(sessionStartedAt) : ''}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v) return;
                  const t = new Date(v).getTime();
                  if (!Number.isFinite(t)) return;
                  setSessionStartedAt(t);
                  setNowMs(Date.now());
                }}
              />
            </label>
          </div>
          <Button
            type="button"
            className="mt-4 min-h-12 w-full text-base font-semibold sm:min-h-14 sm:text-lg"
            onClick={() => gearDialogRef.current?.close()}
          >
            Done
          </Button>
        </dialog>

        <section className="flex flex-col gap-4" aria-labelledby="log-session-exercises-heading">
          <div className="flex items-center justify-between gap-3">
            <h2
              id="log-session-exercises-heading"
              className="min-w-0 text-lg font-medium text-(--text-h)"
            >
              Exercises
            </h2>
            <Button
              type="button"
              variant="secondary"
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 px-3.5"
              onClick={openAddExerciseDialog}
            >
              Add exercise
            </Button>
          </div>

          {exercisesFA.fields.map((field, ei) => (
            <SessionExerciseEditor
              key={field.id}
              ei={ei}
              form={form}
              exerciseCount={exercisesFA.fields.length}
              onOpenReorder={onOpenReorder}
              onRemove={() => {
                if (exercisesFA.fields.length <= 1) return;
                exercisesFA.remove(ei);
                renumberAll();
              }}
            />
          ))}
        </section>

        <AddSessionExerciseDialog
          dialogRef={addExerciseDialogRef}
          resetSignal={addExerciseReset}
          defaultInsertIndex={addExerciseDefaultIndex}
          exerciseLabels={addExercisePositionLabels}
          onAdd={({ row, insertIndex }) => {
            exercisesFA.insert(insertIndex, row);
            renumberAll();
            addExerciseDialogRef.current?.close();
          }}
        />

        {form.formState.errors.exercises?.message ? (
          <p className="text-sm text-red-600" role="alert">
            {String(form.formState.errors.exercises.message)}
          </p>
        ) : null}

        {form.formState.errors.root?.message ||
        (mutation.isError ? errorMessageFromUnknown(mutation.error) : null) ? (
          <p className="text-sm text-red-600" role="alert">
            {form.formState.errors.root?.message ??
              (mutation.isError ? errorMessageFromUnknown(mutation.error) : undefined)}
          </p>
        ) : null}

        {mutation.isPending ? <p className="text-sm text-(--text)">Saving…</p> : null}

        {exercisesFA.fields.length === 0 ? (
          <p className="text-sm text-(--text)">
            Loading exercises… If this persists, go back and pick a workout from{' '}
            <Link to="/sessions/start" className="text-(--accent)">
              Start
            </Link>
            .
          </p>
        ) : null}
      </form>

      <PartialLogSessionDialog open={partialDialogOpen} onChoice={resolvePartialChoice} />
      {navigationLeavePrompt}
    </div>
  );
}
