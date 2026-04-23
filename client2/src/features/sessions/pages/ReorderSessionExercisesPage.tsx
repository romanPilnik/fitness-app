import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useConfirm } from '@/components/ConfirmProvider';
import { cn } from '@/lib/utils';
import { isValidDateKey } from '../sessionCalendarUtils';
import { readLiveSessionDraft, writeLiveSessionDraft } from '../liveSessionDraftStorage';
import { useLiveSessionChrome } from '../liveSessionChromeContext';
import type { LogSessionForm } from '../schemas';

type Row = { key: string; exercise: LogSessionForm['exercises'][number] };

function newRowKey() {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function rowsFromExercises(exercises: LogSessionForm['exercises']): Row[] {
  return exercises.map((ex) => ({ key: newRowKey(), exercise: ex }));
}

function orderKey(items: Row[]): string {
  return items.map((r) => r.exercise.exerciseId).join('\0');
}

function formatElapsedTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

function buildNewSearch(
  programId: string,
  workoutId: string,
  occurrenceId: string | null,
  scheduledOn: string,
): string {
  const base = new URLSearchParams();
  if (programId) base.set('programId', programId);
  if (workoutId) base.set('programWorkoutId', workoutId);
  if (occurrenceId) base.set('occurrenceId', occurrenceId);
  if (scheduledOn) base.set('scheduledOn', scheduledOn);
  return `?${base.toString()}`;
}

function SortableExerciseRow({ row }: { row: Row }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.key,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const label = row.exercise.exerciseName?.trim() || 'Exercise';
  return (
    <li className="min-w-0">
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          'flex w-full min-w-0 cursor-grab touch-manipulation select-none items-center gap-2 rounded-xl border border-(--border) bg-(--bg) px-2 py-2.5 active:scale-[0.99] active:cursor-grabbing sm:gap-3 sm:px-3',
          'transition-[transform,box-shadow,opacity,background-color] duration-150 hover:bg-(--code-bg)/40',
          isDragging && 'z-20 cursor-grabbing opacity-90 shadow-(--shadow) ring-1 ring-(--accent-border)/40',
        )}
      >
        <span
          className="inline-flex size-8 shrink-0 items-center justify-center text-zinc-500"
          aria-hidden
        >
          <RefreshCw className="size-4 shrink-0" strokeWidth={2.25} />
        </span>
        <span className="min-w-0 flex-1 truncate text-base font-medium text-(--text-h) sm:text-lg">
          {label}
        </span>
      </div>
    </li>
  );
}

export function ReorderSessionExercisesPage() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { setChrome } = useLiveSessionChrome();
  const confirm = useConfirm();
  const programIdParam = search.get('programId') ?? '';
  const workoutIdParam = search.get('programWorkoutId') ?? '';
  const occurrenceId = search.get('occurrenceId');
  const scheduledOnParamRaw = search.get('scheduledOn');
  const scheduledOnParam = isValidDateKey(scheduledOnParamRaw) ? scheduledOnParamRaw : '';
  const hasSessionQuery = Boolean(programIdParam && workoutIdParam);
  const listId = useId();
  const listCopyId = useId();

  const sessionKey = useMemo(
    () => (userId && hasSessionQuery ? `${userId}\0${programIdParam}\0${workoutIdParam}` : ''),
    [userId, hasSessionQuery, programIdParam, workoutIdParam],
  );

  const fromStorage = useMemo(() => {
    if (!userId || !hasSessionQuery) return null;
    return readLiveSessionDraft(userId, programIdParam, workoutIdParam);
  }, [userId, hasSessionQuery, programIdParam, workoutIdParam]);

  const baseRows = useMemo(
    () => (fromStorage ? rowsFromExercises(fromStorage.form.exercises) : null),
    [fromStorage],
  );

  const exerciseIdSig = useMemo(
    () => (fromStorage ? fromStorage.form.exercises.map((e) => e.exerciseId).join('\0') : ''),
    [fromStorage],
  );

  /** Drag-order overrides, scoped to session + current exercise set (draft can change in another view). */
  const [orderOverride, setOrderOverride] = useState<{
    sessionKey: string;
    exerciseIdSig: string;
    rows: Row[];
  } | null>(null);

  const rows: Row[] | null = useMemo(() => {
    if (baseRows == null) return null;
    if (
      orderOverride &&
      orderOverride.sessionKey === sessionKey &&
      orderOverride.exerciseIdSig === exerciseIdSig
    ) {
      return orderOverride.rows;
    }
    return baseRows;
  }, [baseRows, orderOverride, sessionKey, exerciseIdSig]);

  const orderChanged = useMemo(() => {
    if (rows == null || baseRows == null) return false;
    return orderKey(rows) !== orderKey(baseRows);
  }, [rows, baseRows]);

  const newSearch = useMemo(
    () => buildNewSearch(programIdParam, workoutIdParam, occurrenceId, scheduledOnParam),
    [programIdParam, workoutIdParam, occurrenceId, scheduledOnParam],
  );

  const gotoLogSession = useCallback(() => {
    navigate({ pathname: '/sessions/new', search: newSearch });
  }, [navigate, newSearch]);

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      if (rows == null) return;
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      const from = rows.findIndex((r) => r.key === String(active.id));
      const to = rows.findIndex((r) => r.key === String(over.id));
      if (from < 0 || to < 0) return;
      setOrderOverride({ sessionKey, exerciseIdSig, rows: arrayMove(rows, from, to) });
    },
    [rows, sessionKey, exerciseIdSig],
  );

  const [timeNow, setTimeNow] = useState(() => Date.now());
  const sessionStartedAt = fromStorage?.sessionStartedAt ?? null;

  useEffect(() => {
    if (sessionStartedAt == null) return;
    const id = window.setInterval(() => {
      setTimeNow(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, [sessionStartedAt]);

  const elapsedLabel = useMemo(() => {
    if (sessionStartedAt == null) return '—';
    const elapsedSeconds = Math.min(
      Math.floor((timeNow - sessionStartedAt) / 1000),
      600 * 60,
    );
    return formatElapsedTime(elapsedSeconds);
  }, [sessionStartedAt, timeNow]);

  const handleSave = useCallback(() => {
    if (rows == null || fromStorage == null) return;
    const nextExercises: LogSessionForm['exercises'] = rows.map((r, i) => ({
      ...r.exercise,
      order: i + 1,
    }));
    const nextForm: LogSessionForm = {
      ...fromStorage.form,
      exercises: nextExercises,
    };
    writeLiveSessionDraft({
      userId,
      programId: programIdParam,
      programWorkoutId: workoutIdParam,
      sessionStartedAt: fromStorage.sessionStartedAt,
      form: nextForm,
    });
    gotoLogSession();
  }, [rows, fromStorage, userId, programIdParam, workoutIdParam, gotoLogSession]);

  const handleBack = useCallback(async () => {
    if (orderChanged) {
      const ok = await confirm('Discard order changes and go back to the workout?', {
        confirmLabel: 'Discard',
        cancelLabel: 'Keep editing',
      });
      if (!ok) return;
    }
    gotoLogSession();
  }, [confirm, orderChanged, gotoLogSession]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!hasSessionQuery) {
      setChrome(null);
      return;
    }
    setChrome({
      headerVariant: 'reorder',
      workoutTitleLine: 'Exercise order',
      elapsedLabel,
      isPaused: false,
      onQuit: () => {
        void handleBack();
      },
      onPauseToggle: () => {
        void 0;
      },
      onOpenGear: () => {
        void 0;
      },
      onComplete: handleSave,
      completeDisabled: rows == null || !orderChanged,
    });
    return () => {
      setChrome(null);
    };
  }, [hasSessionQuery, setChrome, handleBack, handleSave, elapsedLabel, rows, orderChanged]);

  useEffect(() => {
    if (!hasSessionQuery) return;
    document.documentElement.dataset.liveSession = 'true';
    return () => {
      delete document.documentElement.dataset.liveSession;
    };
  }, [hasSessionQuery]);

  if (!hasSessionQuery) {
    return <Navigate to="/sessions/start" replace />;
  }

  if (!userId) {
    return null;
  }

  if (rows == null) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-8 sm:py-10">
        <p className="text-sm text-(--text)">
          Nothing to reorder. Open a workout from{' '}
          <Link to="/sessions/start" className="text-(--accent)">
            Start
          </Link>
          , then return here.
        </p>
        <button
          type="button"
          onClick={gotoLogSession}
          className="self-start text-left text-sm font-medium text-(--accent) underline-offset-2 hover:underline"
        >
          Back to workout
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-5 sm:px-5 sm:py-6">
      <p id={listId} className="text-sm text-(--text)">
        <span className="sr-only" id={listCopyId}>
          Reorder by dragging each row. Save from the top bar.
        </span>
        Drag a row to change order, then save with the check in the bar above.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={rows.map((r) => r.key)} strategy={verticalListSortingStrategy}>
          <ol
            className="flex list-none flex-col gap-2 p-0"
            role="list"
            aria-labelledby={listId}
            aria-describedby={listCopyId}
          >
            {rows.map((row) => (
              <SortableExerciseRow key={row.key} row={row} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </div>
  );
}
