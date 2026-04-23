import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import { cn } from '@/lib/utils';
import {
  fetchGeneratedTargetsBatch,
  fetchNextProgramWorkout,
  fetchProgramById,
  fetchProgramOccurrences,
  programQueryKeys,
  type GeneratedTargetsPayload,
} from '../api';
import { ProgramMetadataChips } from '../components/ProgramMetadataChips';
import {
  isLocalDateKeyBeforeToday,
  localDateKey,
  parseIsoToLocalDateKey,
} from '@/features/sessions/sessionCalendarUtils';
import type { ProgramWorkout, ProgramWorkoutExercise } from '../types';

export function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const programId = id ?? '';
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const query = useQuery({
    queryKey: programQueryKeys.detail(programId),
    queryFn: () => fetchProgramById(programId),
    enabled: Boolean(programId),
    staleTime: 1000 * 60,
  });

  const nextQ = useQuery({
    queryKey: programQueryKeys.nextWorkout(programId, timeZone),
    queryFn: () => fetchNextProgramWorkout(programId, timeZone),
    enabled: Boolean(programId) && query.isSuccess,
    staleTime: 30_000,
  });

  const workoutIds =
    query.data?.programWorkouts.map((w) => w.id).sort() ?? [];

  const targetsQ = useQuery({
    queryKey: [...programQueryKeys.detail(programId), 'generated-targets-batch', workoutIds.join(',')],
    queryFn: () => fetchGeneratedTargetsBatch(workoutIds),
    enabled: workoutIds.length > 0 && query.isSuccess,
    staleTime: 60_000,
  });

  const pForRange = query.data;
  const programStartToTodayRange = useMemo(() => {
    if (!pForRange) return { dateFrom: '', dateTo: '' };
    const dateFrom = parseIsoToLocalDateKey(pForRange.startDate);
    const dateTo = localDateKey(new Date());
    return { dateFrom, dateTo };
  }, [pForRange]);

  const backlogOccQ = useQuery({
    queryKey: programQueryKeys.occurrences(programId, programStartToTodayRange),
    queryFn: () => fetchProgramOccurrences(programId, programStartToTodayRange),
    enabled: Boolean(programId) && query.isSuccess && Boolean(programStartToTodayRange.dateFrom),
    staleTime: 30_000,
  });

  const additionalOverdueCount = useMemo(() => {
    const rows = backlogOccQ.data ?? [];
    const overdue = rows.filter(
      (o) =>
        o.status === 'planned' &&
        !o.sessionId &&
        isLocalDateKeyBeforeToday(parseIsoToLocalDateKey(o.scheduledOn)),
    );
    return Math.max(0, overdue.length - 1);
  }, [backlogOccQ.data]);

  const targetsByWorkoutId = new Map(
    (targetsQ.data ?? []).filter((x) => x.targets).map((x) => [x.programWorkoutId, x.targets!]),
  );

  if (!programId) {
    return (
      <>
        <SubpageHeader fallbackTo="/programs" title="Programs" backLabel="Back to programs" />
        <PageContainer className="py-8">
          <p className="text-sm text-(--text)">Missing program id.</p>
        </PageContainer>
      </>
    );
  }

  if (query.isError) {
    return (
      <>
        <SubpageHeader fallbackTo="/programs" title="Programs" backLabel="Back to programs" />
        <PageContainer className="py-8">
          <QueryErrorMessage error={query.error} refetch={() => query.refetch()} />
        </PageContainer>
      </>
    );
  }

  if (query.isPending || !query.data) {
    return (
      <>
        <SubpageHeader fallbackTo="/programs" title="Program" backLabel="Back to programs" />
        <PageContainer className="py-8">
          <p className="text-sm text-(--text)">Loading…</p>
        </PageContainer>
      </>
    );
  }

  const p = query.data;
  const workouts = [...p.programWorkouts].sort(
    (a, b) => (a.sequenceIndex ?? a.dayNumber) - (b.sequenceIndex ?? b.dayNumber),
  );
  const startBase = `/sessions/start?programId=${encodeURIComponent(programId)}`;
  const editHref = `/programs/${encodeURIComponent(programId)}/edit`;

  const next = nextQ.data;
  const nextScheduleKey = next ? parseIsoToLocalDateKey(next.scheduledOn) : '';
  const nextHref = next
    ? `${startBase}&programWorkoutId=${encodeURIComponent(next.programWorkoutId)}&occurrenceId=${encodeURIComponent(next.id)}&scheduledOn=${encodeURIComponent(nextScheduleKey)}`
    : `${startBase}`;
  const nextDateKey = next ? parseIsoToLocalDateKey(next.scheduledOn) : null;
  const isNextOverdue = nextDateKey !== null && isLocalDateKeyBeforeToday(nextDateKey);

  return (
    <>
      <SubpageHeader fallbackTo="/programs" title={p.name} backLabel="Back to programs" />
      <PageContainer className="gap-6 py-8">
        <header className="flex flex-col gap-4">
          {p.description ? (
            <p className="text-sm leading-relaxed text-(--text)">{p.description}</p>
          ) : null}
          <ProgramMetadataChips
            status={p.status}
            goal={p.goal}
            difficulty={p.difficulty}
            splitType={p.splitType}
          />
          <p className="text-sm text-(--text)">
            {p.daysPerWeek} days per week · {p.lengthWeeks ?? 8} weeks · Started{' '}
            {new Date(p.startDate).toLocaleDateString()}
          </p>

          {next ? (
            <div
              className={cn(
                'rounded-xl border px-4 py-3',
                isNextOverdue
                  ? 'border-amber-500/50 bg-amber-500/10'
                  : 'border-(--accent-border) bg-(--accent-bg)',
              )}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-(--text)">
                {isNextOverdue ? 'Due (missed) — do next' : 'Next workout'}
              </p>
              <p className="mt-1 text-base font-medium text-(--text-h)">{next.programWorkout.name}</p>
              <p className="text-sm text-(--text)">
                {new Date(
                  next.scheduledOn.includes('T')
                    ? next.scheduledOn
                    : `${next.scheduledOn}T12:00:00`,
                ).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
                {isNextOverdue ? (
                  <span className="ml-1.5 text-amber-800 dark:text-amber-200/90">· before today</span>
                ) : null}
              </p>
              {isNextOverdue && additionalOverdueCount > 0 ? (
                <p className="mt-2 text-xs text-amber-900/90 dark:text-amber-100/85">
                  After you log this, {additionalOverdueCount} more overdue session
                  {additionalOverdueCount === 1 ? '' : 's'} remain in your backlog.
                </p>
              ) : null}
            </div>
          ) : nextQ.isSuccess ? (
            <p className="text-sm text-(--text)">No upcoming planned sessions in this program.</p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              to={nextHref}
              className={cn(
                'inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-(--text-h) px-4 py-2.5 text-base font-medium text-(--bg) hover:opacity-90',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)',
                'sm:min-w-[min(100%,12rem)] sm:flex-none',
              )}
            >
              {next ? 'Start next workout' : 'Start workout'}
            </Link>
            <Link
              to={editHref}
              className={cn(
                'inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-(--border) bg-transparent px-4 py-2.5 text-base font-medium text-(--text-h) hover:bg-(--code-bg)',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)',
                'sm:min-w-[min(100%,12rem)] sm:flex-none',
              )}
            >
              Edit program
            </Link>
          </div>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-medium text-(--text-h)">Workouts</h2>
          <div className="flex flex-col gap-4">
            {workouts.map((w) => (
              <ReadOnlyWorkoutCard
                key={w.id}
                workout={w}
                aiTargets={targetsByWorkoutId.get(w.id) ?? null}
              />
            ))}
          </div>
        </section>
      </PageContainer>
    </>
  );
}

function ReadOnlyWorkoutCard({
  workout: w,
  aiTargets,
}: {
  workout: ProgramWorkout;
  aiTargets: GeneratedTargetsPayload | null;
}) {
  const exercises = [...w.programWorkoutExercises].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-xl border border-(--border) bg-(--bg) p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="font-medium text-(--text-h)">
          {(w.sequenceIndex ?? w.dayNumber) ? `Workout ${w.sequenceIndex ?? w.dayNumber}: ` : ''}
          {w.name}
        </h3>
        {aiTargets ? (
          <span className="shrink-0 rounded-md bg-(--code-bg) px-2 py-0.5 text-xs font-medium text-(--text-h)">
            AI targets ready
          </span>
        ) : (
          <span className="shrink-0 text-xs text-(--text)">Program targets only (no AI progression yet)</span>
        )}
      </div>
      {exercises.length === 0 ? (
        <p className="mt-3 text-sm text-(--text)">No exercises in this day yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-(--border) border-t border-(--border)">
          {exercises.map((slot) => (
            <ExerciseReadRow key={slot.id} slot={slot} aiTargets={aiTargets} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ExerciseReadRow({
  slot,
  aiTargets,
}: {
  slot: ProgramWorkoutExercise;
  aiTargets: GeneratedTargetsPayload | null;
}) {
  const exerciseTitle = slot.exercise?.name ?? 'Exercise';
  const aiEx = aiTargets?.exercises.find((e) => e.exerciseId === slot.exerciseId);
  return (
    <li className="flex flex-col gap-1 py-3 first:pt-3">
      <Link
        to={`/exercises/${slot.exerciseId}`}
        className="font-medium text-(--accent) underline-offset-2 hover:underline"
      >
        {exerciseTitle}
      </Link>
      <p className="text-sm text-(--text)">
        {slot.targetSets} sets
        {slot.targetWeight != null ? ` · program target ${slot.targetWeight}` : ''}
      </p>
      {aiEx ? (
        <p className="text-xs text-(--text)">
          AI: {aiEx.sets.length} set targets
          {aiEx.sets[0]
            ? ` · e.g. ${aiEx.sets[0].targetWeight} kg × ${aiEx.sets[0].targetReps} reps`
            : ''}
        </p>
      ) : null}
    </li>
  );
}
