import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { DEFAULT_LIST_LIMIT } from '@/api/pagination';
import { PageContainer } from '@/components/layout/PageContainer';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { Button } from '@/components/ui/button';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import { EmptyState } from '@/components/ui/empty-state';
import {
  fetchNextProgramWorkout,
  fetchProgramById,
  fetchProgramsPage,
  programQueryKeys,
} from '@/features/programs/api';

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function StartWorkoutPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const programId = searchParams.get('programId')?.trim() || null;

  const setProgramSelection = (id: string | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id) {
          next.set('programId', id);
        } else {
          next.delete('programId');
        }
        return next;
      },
      { replace: true },
    );
  };

  const programsQ = useInfiniteQuery({
    queryKey: [...programQueryKeys.all, 'list', 'start-picker'],
    queryFn: ({ pageParam }) =>
      fetchProgramsPage({
        cursor: pageParam,
        limit: DEFAULT_LIST_LIMIT,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore && last.nextCursor ? last.nextCursor : undefined),
    staleTime: 60_000,
  });

  const programDetailQ = useQuery({
    queryKey: programQueryKeys.detail(programId ?? ''),
    queryFn: () => fetchProgramById(programId!),
    enabled: Boolean(programId),
    staleTime: 30_000,
  });

  const nextWorkoutQ = useQuery({
    queryKey: programQueryKeys.nextWorkout(programId ?? '', timeZone),
    queryFn: () => fetchNextProgramWorkout(programId!, timeZone),
    enabled: Boolean(programId),
    staleTime: 30_000,
  });

  const programs = useMemo(
    () => programsQ.data?.pages.flatMap((p) => p.data) ?? [],
    [programsQ.data],
  );

  if (programsQ.isError) {
    return (
      <>
        <SubpageHeader fallbackTo="/home" title="Start workout" backLabel="Back to home" />
        <PageContainer className="gap-4 py-8">
          <QueryErrorMessage error={programsQ.error} refetch={() => programsQ.refetch()} />
        </PageContainer>
      </>
    );
  }

  if (!programId) {
    return (
      <>
        <SubpageHeader fallbackTo="/home" title="Start workout" backLabel="Back to home" />
        <PageContainer className="gap-6 py-8">
          {programsQ.isPending ? (
            <p className="text-sm text-(--text)">Loading programs…</p>
          ) : programs.length === 0 ? (
            <EmptyState
              title="No programs yet"
              action={
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    to="/programs/new"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-(--text-h) px-4 py-2.5 text-base font-medium text-(--bg) hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
                  >
                    New program
                  </Link>
                  <Link
                    to="/programs"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-(--border) bg-transparent px-4 py-2.5 text-base font-medium text-(--text-h) hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
                  >
                    My programs
                  </Link>
                </div>
              }
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {programs.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setProgramSelection(p.id)}
                    className="flex w-full min-h-11 flex-col items-start rounded-lg border border-(--border) px-4 py-3 text-left transition-colors hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
                  >
                    <span className="text-sm font-medium text-(--text-h)">{p.name}</span>
                    <span className="mt-0.5 text-xs capitalize text-(--text)">
                      {p.goal} · {p.status} · {p.daysPerWeek} days/wk
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {programsQ.hasNextPage ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              disabled={programsQ.isFetchingNextPage}
              onClick={() => void programsQ.fetchNextPage()}
            >
              {programsQ.isFetchingNextPage ? 'Loading…' : 'Load more'}
            </Button>
          ) : null}
        </PageContainer>
      </>
    );
  }

  if (programDetailQ.isError) {
    return (
      <>
        <SubpageHeader
          fallbackTo="/sessions/start"
          title="Start workout"
          backLabel="Back to program list"
          onBack={() => setProgramSelection(null)}
        />
        <PageContainer className="gap-4 py-8">
          <QueryErrorMessage error={programDetailQ.error} refetch={() => programDetailQ.refetch()} />
        </PageContainer>
      </>
    );
  }

  const program = programDetailQ.data;
  const nextProgramWorkoutId = nextWorkoutQ.data?.programWorkoutId ?? null;
  const workouts = program
    ? [...program.programWorkouts].sort(
        (a, b) =>
          (a.sequenceIndex ?? a.dayNumber) - (b.sequenceIndex ?? b.dayNumber) || a.name.localeCompare(b.name),
      )
    : [];

  return (
    <>
      <SubpageHeader
        fallbackTo="/programs"
        title={programDetailQ.isPending ? 'Program' : (program?.name ?? 'Program')}
        backLabel="Back to program list"
        onBack={() => setProgramSelection(null)}
      />
      <PageContainer className="gap-6 py-8">
      <header className="border-b border-(--border) pb-4">
        <p className="text-sm text-(--text)">Pick a workout to begin logging.</p>
      </header>

      {programDetailQ.isPending ? (
        <p className="text-sm text-(--text)">Loading workouts…</p>
      ) : workouts.length === 0 ? (
        <EmptyState
          title="No workout days"
          description="Add workout days to this program from the program screen, then return here."
          action={
            <Link
              to={`/programs/${programId}`}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-(--border) bg-transparent px-4 py-2.5 text-base font-medium text-(--text-h) hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
            >
              Open program
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {workouts.map((w) => {
            const isNext = Boolean(nextProgramWorkoutId && nextProgramWorkoutId === w.id);
            return (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/sessions/new?programId=${encodeURIComponent(programId)}&programWorkoutId=${encodeURIComponent(w.id)}`,
                    )
                  }
                  className="flex w-full min-h-11 flex-row items-center justify-between gap-3 rounded-lg border border-(--border) px-4 py-3 text-left transition-colors hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
                >
                  <span className="flex min-w-0 flex-1 flex-col items-start text-left">
                    <span className="text-sm font-medium text-(--text-h)">
                      Day {w.dayNumber}: {w.name}
                    </span>
                    <span className="mt-0.5 text-xs text-(--text)">
                      {w.programWorkoutExercises.length} exercises
                    </span>
                  </span>
                  {isNext ? (
                    <span
                      className="shrink-0 rounded-md border border-(--accent-border) bg-(--accent-bg) px-2.5 py-1 text-center text-[0.7rem] font-semibold uppercase leading-none tracking-wide text-(--text-h)"
                      title="Next workout in your program schedule"
                    >
                      Next
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      </PageContainer>
    </>
  );
}
