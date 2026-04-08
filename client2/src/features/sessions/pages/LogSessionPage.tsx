import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  useFieldArray,
  useForm,
  useFormState,
  useWatch,
  type Resolver,
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
import { SessionExerciseEditor } from '../components/SessionExerciseEditor';
import {
  classifyLogSessionCompletion,
  pruneLogSessionToCompletedSetsOnly,
} from '../logSessionSubmitHelpers';
import { defaultSets, oneEmptySet } from '../sessionFormDefaults';
import { createSession, sessionQueryKeys } from '../api';
import { readLiveSessionDraft, writeLiveSessionDraft } from '../liveSessionDraftStorage';
import { useLiveSessionChrome } from '../liveSessionChromeContext';
import { useLiveSession } from '../useLiveSession';
import { deriveSessionStatusFromSets, logSessionFormSchema, type LogSessionForm } from '../schemas';

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

function newExerciseRow(order: number): LogSessionForm['exercises'][number] {
  return {
    exerciseId: '',
    exerciseName: undefined,
    order,
    targetSets: 1,
    targetWeight: undefined,
    targetTotalReps: undefined,
    targetTopSetReps: undefined,
    targetRir: undefined,
    sets: [oneEmptySet()],
  };
}

function renumberExerciseOrders(
  form: UseFormReturn<LogSessionForm, unknown, LogSessionForm>,
  len: number,
) {
  for (let i = 0; i < len; i++) {
    form.setValue(`exercises.${i}.order`, i + 1);
  }
}

export function LogSessionPage() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const initKeyRef = useRef<string | null>(null);
  const allowPersistRef = useRef(false);
  const sessionStartedAtRef = useRef<number | null>(null);
  const persistDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const gearDialogRef = useRef<HTMLDialogElement>(null);
  const gearTitleId = useId();
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

  const form = useForm<LogSessionForm>({
    resolver: zodResolver(logSessionFormSchema) as Resolver<LogSessionForm>,
    defaultValues: {
      programId: programIdParam,
      workoutName: '',
      dayNumber: 1,
      sessionStatus: 'completed',
      exercises: [],
    },
  });

  const { isDirty } = useFormState({ control: form.control });
  const prepareLeave = useConfirmLeaveWhenDirty(isDirty);

  const workoutName = useWatch({ control: form.control, name: 'workoutName' });
  const dayNumber = useWatch({ control: form.control, name: 'dayNumber' });

  useEffect(() => {
    if (!programQ.data || !workoutIdParam || !userId) {
      if (programIdParam) form.setValue('programId', programIdParam);
      return;
    }
    const w = programQ.data.programWorkouts.find((x) => x.id === workoutIdParam);
    if (!w) return;

    const currentKey = `${userId}:${programIdParam}:${workoutIdParam}`;
    if (initKeyRef.current === currentKey) {
      return;
    }

    allowPersistRef.current = false;
    const draft = readLiveSessionDraft(userId, programIdParam, workoutIdParam);
    const rows = [...w.programWorkoutExercises].sort((a, b) => a.order - b.order);

    if (draft) {
      form.reset(draft.form);
      const t = draft.sessionStartedAt;
      setSessionStartedAt(t);
      setNowMs(Date.now());
      sessionStartedAtRef.current = t;
      setPausedAt(null);
    } else {
      const startedAt = Date.now();
      form.reset({
        programId: programQ.data.id,
        workoutName: w.name,
        dayNumber: w.dayNumber,
        sessionStatus: 'completed',
        exercises: rows.map((slot) => ({
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
        })),
      });
      setSessionStartedAt(startedAt);
      setNowMs(startedAt);
      sessionStartedAtRef.current = startedAt;
      setPausedAt(null);
    }

    initKeyRef.current = currentKey;
    queueMicrotask(() => {
      allowPersistRef.current = true;
    });
  }, [programQ.data, workoutIdParam, programIdParam, userId, form]);

  useEffect(() => {
    if (!hasSessionParams || !userId) return;

    const subscription = form.watch(() => {
      if (!allowPersistRef.current) return;
      if (persistDebounceRef.current) clearTimeout(persistDebounceRef.current);
      persistDebounceRef.current = setTimeout(() => {
        persistDebounceRef.current = null;
        const started = sessionStartedAtRef.current;
        if (started == null) return;
        writeLiveSessionDraft({
          userId,
          programId: programIdParam,
          programWorkoutId: workoutIdParam,
          sessionStartedAt: started,
          form: form.getValues(),
        });
      }, 300);
    });

    return () => {
      subscription.unsubscribe();
      if (persistDebounceRef.current) {
        clearTimeout(persistDebounceRef.current);
        persistDebounceRef.current = null;
      }
    };
  }, [hasSessionParams, userId, programIdParam, workoutIdParam, form]);

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

  const mutation = useMutation({
    mutationFn: createSession,
    onSuccess: (session) => {
      prepareLeave();
      clearLiveSession();
      qc.invalidateQueries({ queryKey: sessionQueryKeys.all });
      qc.invalidateQueries({ queryKey: programQueryKeys.active() });
      qc.invalidateQueries({ queryKey: exercisePerformanceQueryKeys.all });
      navigate(`/sessions/${session.id}`);
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
      <form
        ref={formRef}
        className="flex flex-col gap-8"
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
              workoutName: payload.workoutName.trim(),
              dayNumber: payload.dayNumber,
              sessionStatus,
              sessionDuration: elapsedMin,
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

        {exercisesFA.fields.map((field, ei) => (
          <SessionExerciseEditor
            key={field.id}
            ei={ei}
            form={form}
            exerciseCount={exercisesFA.fields.length}
            onMoveUp={() => {
              if (ei <= 0) return;
              exercisesFA.move(ei, ei - 1);
              renumberAll();
            }}
            onMoveDown={() => {
              if (ei >= exercisesFA.fields.length - 1) return;
              exercisesFA.move(ei, ei + 1);
              renumberAll();
            }}
            onRemove={() => {
              if (exercisesFA.fields.length <= 1) return;
              exercisesFA.remove(ei);
              renumberAll();
            }}
          />
        ))}

        <Button
          type="button"
          variant="secondary"
          className="self-start min-h-14 px-8 text-lg font-semibold tracking-tight sm:min-h-[3.75rem] sm:text-xl"
          onClick={() => {
            exercisesFA.append(newExerciseRow(1));
            renumberAll();
          }}
        >
          + Exercise
        </Button>

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
    </div>
  );
}
