import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DEFAULT_LIST_LIMIT } from '@/api/pagination';
import { PageContainer } from '@/components/layout/PageContainer';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { fetchProgramById, fetchProgramsPage, programQueryKeys } from '@/features/programs/api';

export function StartWorkoutPage() {
  const navigate = useNavigate();
  const [programId, setProgramId] = useState<string | null>(null);

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

  const programs = useMemo(
    () => programsQ.data?.pages.flatMap((p) => p.data) ?? [],
    [programsQ.data],
  );

  if (programsQ.isError) {
    return (
      <PageContainer className="gap-4 py-8">
        <QueryErrorMessage error={programsQ.error} refetch={() => programsQ.refetch()} />
      </PageContainer>
    );
  }

  if (!programId) {
    return (
      <PageContainer className="gap-6 py-8">
        <header className="border-b border-(--border) pb-4">
          <Link to="/home" className="text-sm font-medium text-(--accent)">
            ← Home
          </Link>
          <h1 className="mt-3 text-2xl font-medium text-(--text-h)">Start workout</h1>
          <p className="mt-1 text-sm text-(--text)">Choose a program, then pick a workout day.</p>
        </header>

        {programsQ.isPending ? (
          <p className="text-sm text-(--text)">Loading programs…</p>
        ) : programs.length === 0 ? (
          <EmptyState
            title="No programs yet"
            description="Create a program from the library or from scratch, then come back here to log a session."
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
                  onClick={() => setProgramId(p.id)}
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
    );
  }

  if (programDetailQ.isError) {
    return (
      <PageContainer className="gap-4 py-8">
        <QueryErrorMessage error={programDetailQ.error} refetch={() => programDetailQ.refetch()} />
        <Button type="button" variant="secondary" onClick={() => setProgramId(null)}>
          Back to programs
        </Button>
      </PageContainer>
    );
  }

  const program = programDetailQ.data;
  const workouts = program
    ? [...program.programWorkouts].sort((a, b) => a.dayNumber - b.dayNumber || a.name.localeCompare(b.name))
    : [];

  return (
    <PageContainer className="gap-6 py-8">
      <header className="border-b border-(--border) pb-4">
        <button
          type="button"
          onClick={() => setProgramId(null)}
          className="text-sm font-medium text-(--accent)"
        >
          ← Programs
        </button>
        <h1 className="mt-3 text-2xl font-medium text-(--text-h)">
          {programDetailQ.isPending ? 'Loading…' : (program?.name ?? 'Program')}
        </h1>
        <p className="mt-1 text-sm text-(--text)">Pick a workout to begin logging.</p>
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
          {workouts.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/sessions/new?programId=${encodeURIComponent(programId)}&programWorkoutId=${encodeURIComponent(w.id)}`,
                  )
                }
                className="flex w-full min-h-11 flex-col items-start rounded-lg border border-(--border) px-4 py-3 text-left transition-colors hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
              >
                <span className="text-sm font-medium text-(--text-h)">
                  Day {w.dayNumber}: {w.name}
                </span>
                <span className="mt-0.5 text-xs text-(--text)">
                  {w.programWorkoutExercises.length} exercises
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
