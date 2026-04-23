import { useQuery, useQueries } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { Button } from '@/components/ui/button';
import {
  fetchActivePrograms,
  fetchProgramOccurrences,
  programQueryKeys,
} from '@/features/programs/api';
import { formatEnumLabel } from '@/lib/formatEnumLabel';
import { cn } from '@/lib/utils';
import { fetchAllSessionsInDateRange, sessionQueryKeys } from '../api';
import {
  aggregateSessionsByLocalDay,
  badgeCount,
  buildMonthGrid,
  formatDayDialogTitle,
  formatMonthYear,
  localDateKey,
  monthToApiRange,
  isLocalDateKeyBeforeToday,
  parseIsoToLocalDateKey,
  startOfLocalMonth,
  endOfLocalMonth,
  WEEKDAY_LABELS_SUN_FIRST,
} from '../sessionCalendarUtils';
import type { SessionSummary } from '../types';

type VisibleMonth = { year: number; monthIndex: number };

type PlannedDayItem = {
  id: string;
  programId: string;
  programWorkoutId: string;
  programName: string;
  workoutName: string;
  /** Planned day is in the past and still not logged or skipped. */
  isOverdue: boolean;
};

function shiftMonth(v: VisibleMonth, delta: number): VisibleMonth {
  const d = new Date(v.year, v.monthIndex + delta, 1);
  return { year: d.getFullYear(), monthIndex: d.getMonth() };
}

export function WorkoutCalendar() {
  const now = new Date();
  const [visible, setVisible] = useState<VisibleMonth>(() => ({
    year: now.getFullYear(),
    monthIndex: now.getMonth(),
  }));

  const range = useMemo(() => monthToApiRange(visible.year, visible.monthIndex), [visible]);

  const monthDateFrom = useMemo(
    () => localDateKey(startOfLocalMonth(visible.year, visible.monthIndex)),
    [visible.year, visible.monthIndex],
  );
  const monthDateTo = useMemo(
    () => localDateKey(endOfLocalMonth(visible.year, visible.monthIndex)),
    [visible.year, visible.monthIndex],
  );

  const activeProgramsQ = useQuery({
    queryKey: programQueryKeys.active(),
    queryFn: fetchActivePrograms,
    staleTime: 60_000,
  });

  const sessionsQuery = useQuery({
    queryKey: sessionQueryKeys.list('home-calendar', {
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
    }),
    queryFn: () => fetchAllSessionsInDateRange(range),
    staleTime: 30_000,
  });

  const occQueries = useQueries({
    queries: (activeProgramsQ.data ?? []).map((prog) => ({
      queryKey: programQueryKeys.occurrences(prog.id, {
        dateFrom: monthDateFrom,
        dateTo: monthDateTo,
      }),
      queryFn: () =>
        fetchProgramOccurrences(prog.id, {
          dateFrom: monthDateFrom,
          dateTo: monthDateTo,
        }),
      enabled: Boolean(activeProgramsQ.data?.length),
    })),
  });

  const sessionDedupeKeys = useMemo(() => {
    const set = new Set<string>();
    for (const s of sessionsQuery.data ?? []) {
      const pw = s.programWorkoutId;
      if (!pw) continue;
      const k = parseIsoToLocalDateKey(s.datePerformed);
      set.add(`${s.programId}|${pw}|${k}`);
    }
    return set;
  }, [sessionsQuery.data]);

  const plannedByDay = useMemo(() => {
    const map = new Map<string, PlannedDayItem[]>();
    const programs = activeProgramsQ.data;
    if (!programs) return map;
    occQueries.forEach((q, i) => {
      const prog = programs[i];
      if (!prog || !q.data) return;
      for (const o of q.data) {
        if (o.status !== 'planned' || o.sessionId) continue;
        const key = parseIsoToLocalDateKey(o.scheduledOn);
        if (sessionDedupeKeys.has(`${prog.id}|${o.programWorkoutId}|${key}`)) continue;
        const isOverdue = isLocalDateKeyBeforeToday(key);
        const list = map.get(key) ?? [];
        list.push({
          id: o.id,
          programId: prog.id,
          programWorkoutId: o.programWorkoutId,
          programName: prog.name,
          workoutName: o.programWorkout.name,
          isOverdue,
        });
        map.set(key, list);
      }
    });
    return map;
  }, [activeProgramsQ.data, occQueries, sessionDedupeKeys]);

  const byDay = useMemo(
    () => aggregateSessionsByLocalDay(sessionsQuery.data ?? []),
    [sessionsQuery.data],
  );

  const grid = useMemo(
    () => buildMonthGrid(visible.year, visible.monthIndex),
    [visible.year, visible.monthIndex],
  );

  const totalInMonth = sessionsQuery.data?.length ?? 0;
  const plannedCountInMonth = useMemo(() => {
    let n = 0;
    for (const items of plannedByDay.values()) n += items.length;
    return n;
  }, [plannedByDay]);

  const [detail, setDetail] = useState<{
    date: Date;
    sessions: SessionSummary[];
    planned: PlannedDayItem[];
  } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!detail) return;
    const el = dialogRef.current;
    if (el && !el.open) {
      el.showModal();
    }
  }, [detail]);

  const goToday = () => {
    const n = new Date();
    setVisible({ year: n.getFullYear(), monthIndex: n.getMonth() });
  };

  const isViewingCurrentMonth =
    visible.year === now.getFullYear() && visible.monthIndex === now.getMonth();

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-medium uppercase tracking-widest text-(--text)">
          Workout calendar
        </h2>
        <Link
          to="/sessions"
          className="text-xs font-medium uppercase tracking-wider text-(--text-h) underline-offset-4 hover:underline"
        >
          All sessions →
        </Link>
      </div>

      <div className="rounded-lg border border-(--border) bg-(--bg) p-3 shadow-(--shadow)">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-(--border) text-(--text-h) hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
            aria-label="Previous month"
            onClick={() => setVisible((v) => shiftMonth(v, -1))}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <p className="truncate text-center text-sm font-medium text-(--text-h)">
              {formatMonthYear(visible.year, visible.monthIndex)}
            </p>
            <button
              type="button"
              className="text-xs font-medium text-(--accent) underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-40"
              onClick={goToday}
              disabled={isViewingCurrentMonth}
            >
              Today
            </button>
          </div>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-(--border) text-(--text-h) hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
            aria-label="Next month"
            onClick={() => setVisible((v) => shiftMonth(v, 1))}
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>

        {sessionsQuery.isError ? (
          <QueryErrorMessage error={sessionsQuery.error} refetch={() => sessionsQuery.refetch()} />
        ) : activeProgramsQ.isError ? (
          <QueryErrorMessage error={activeProgramsQ.error} refetch={() => activeProgramsQ.refetch()} />
        ) : (
          <>
            <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wide text-(--text) sm:text-xs">
              {WEEKDAY_LABELS_SUN_FIRST.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {grid.map((cell, i) => {
                if (cell.kind === 'padding') {
                  return <div key={`pad-${i}`} className="min-h-11" aria-hidden />;
                }

                const { date, dateKey, isToday, isFuture } = cell;
                const sessions = byDay.get(dateKey) ?? [];
                const planned = plannedByDay.get(dateKey) ?? [];
                const hasOverduePlanned = planned.some((p) => p.isOverdue);
                const count = sessions.length + planned.length;
                const label = badgeCount(count);

                return (
                  <button
                    key={dateKey}
                    type="button"
                    className={cn(
                      'relative flex min-h-11 flex-col items-center justify-start rounded-lg border border-transparent px-0.5 py-1 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)',
                      isToday && 'border-(--accent-border) bg-(--accent-bg)',
                      !isToday && count > 0 && 'bg-(--code-bg) text-(--text-h)',
                      !isToday && count === 0 && 'text-(--text)',
                      isFuture && count === 0 && 'opacity-45',
                      hasOverduePlanned && !isToday && 'ring-1 ring-amber-500/45',
                    )}
                    aria-label={
                      count > 0
                        ? `${formatDayDialogTitle(date)}, ${count} workout${count === 1 ? '' : 's'}`
                        : `${formatDayDialogTitle(date)}, no workouts`
                    }
                    onClick={() => setDetail({ date, sessions, planned })}
                  >
                    <span className="font-medium leading-none">{date.getDate()}</span>
                    {label ? (
                      <span
                        className="mt-0.5 min-w-4.5 rounded-full bg-(--text-h) px-1 text-center text-[10px] font-semibold leading-tight text-(--bg)"
                        aria-hidden
                      >
                        {label}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {sessionsQuery.isPending ? (
              <p className="mt-3 text-center text-xs text-(--text)">Loading workouts…</p>
            ) : totalInMonth > 0 || plannedCountInMonth > 0 ? (
              <p className="mt-3 text-center text-xs text-(--text)">
                {totalInMonth} logged
                {plannedCountInMonth > 0
                  ? ` · ${plannedCountInMonth} planned`
                  : ''}{' '}
                in {formatMonthYear(visible.year, visible.monthIndex)}
              </p>
            ) : null}
          </>
        )}
      </div>

      <dialog
        ref={dialogRef}
        className="w-[calc(100%-2rem)] max-w-md rounded-xl border border-(--border) bg-(--bg) p-0 text-(--text) shadow-lg backdrop:bg-black/40"
        aria-labelledby={titleId}
        onClose={() => setDetail(null)}
      >
        {detail ? (
          <>
            <div className="border-b border-(--border) px-4 py-3">
              <h2 id={titleId} className="text-base font-medium text-(--text-h)">
                {formatDayDialogTitle(detail.date)}
              </h2>
              <p className="mt-0.5 text-xs text-(--text)">
                {detail.sessions.length === 0 && detail.planned.length === 0
                  ? 'Nothing scheduled or logged this day.'
                  : `${detail.sessions.length} logged${detail.planned.length ? ` · ${detail.planned.length} planned` : ''}`}
              </p>
            </div>
            <div className="max-h-[min(50vh,320px)] overflow-y-auto p-3">
              {detail.sessions.length === 0 && detail.planned.length === 0 ? null : (
                <ul className="flex flex-col gap-2">
                  {detail.sessions.map((s) => (
                    <li key={s.id}>
                      <Link
                        to={`/sessions/${s.id}`}
                        className="block rounded-lg border border-(--border) px-3 py-2.5 transition-colors hover:bg-(--code-bg)"
                        onClick={() => dialogRef.current?.close()}
                      >
                        <span className="text-sm font-medium text-(--text-h)">{s.workoutName}</span>
                        <p className="mt-0.5 text-xs text-(--text)">
                          {s.program?.name ?? 'No program'} · {formatEnumLabel(s.sessionStatus)} ·{' '}
                          {Math.round(s.sessionDuration)} min
                        </p>
                      </Link>
                    </li>
                  ))}
                  {detail.planned.map((p) => (
                    <li key={p.id}>
                      <Link
                        to={`/sessions/new?programId=${encodeURIComponent(p.programId)}&programWorkoutId=${encodeURIComponent(p.programWorkoutId)}&occurrenceId=${encodeURIComponent(p.id)}&scheduledOn=${encodeURIComponent(localDateKey(detail.date))}`}
                        className="block rounded-lg border border-dashed border-(--border) px-3 py-2.5 transition-colors hover:bg-(--code-bg)"
                        onClick={() => dialogRef.current?.close()}
                      >
                        <span className="text-sm font-medium text-(--text-h)">{p.workoutName}</span>
                        <p className="mt-0.5 text-xs text-(--text)">
                          {p.isOverdue ? 'Missed — tap to log · ' : 'Planned · '}
                          {p.programName}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-col gap-2 border-t border-(--border) px-4 py-3 sm:flex-row sm:justify-end">
              <Link
                to="/sessions"
                className="inline-flex min-h-11 w-full min-w-[44px] items-center justify-center rounded-lg border border-(--border) bg-transparent px-4 py-2.5 text-base font-medium text-(--text-h) transition-opacity hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border) sm:w-auto"
                onClick={() => dialogRef.current?.close()}
              >
                All sessions
              </Link>
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => dialogRef.current?.close()}
              >
                Close
              </Button>
            </div>
          </>
        ) : null}
      </dialog>
    </section>
  );
}
