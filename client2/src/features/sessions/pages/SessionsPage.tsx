import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_LIST_LIMIT } from '@/api/pagination';
import { PageContainer } from '@/components/layout/PageContainer';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { fetchProgramsPage, programQueryKeys } from '@/features/programs/api';
import { formatEnumLabel } from '@/lib/formatEnumLabel';
import { cn } from '@/lib/utils';
import { SessionListFiltersBar } from '../components/SessionListFiltersBar';
import { fetchSessionsPage, sessionQueryKeys, type SessionListFiltersKey } from '../api';
import type { SessionDatePreset } from '../sessionDateRange';
import { sessionDateRangeToApiParams } from '../sessionDateRange';

const rowMeta = 'text-sm text-(--text)';

function formatSessionWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function SessionsPage() {
  const [sessionStatus, setSessionStatus] = useState('');
  const [programId, setProgramId] = useState('');
  const [datePreset, setDatePreset] = useState<SessionDatePreset>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const programsQuery = useQuery({
    queryKey: [...programQueryKeys.all, 'sessions-filter-options'],
    queryFn: () => fetchProgramsPage({ limit: 100 }),
    staleTime: 60_000,
  });

  const programOptions = programsQuery.data?.data ?? [];

  const apiDateParams = useMemo(
    () => sessionDateRangeToApiParams(datePreset, customFrom, customTo),
    [datePreset, customFrom, customTo],
  );

  const listFilters: SessionListFiltersKey = useMemo(
    () => ({
      ...(sessionStatus ? { sessionStatus } : {}),
      ...(programId ? { programId } : {}),
      ...apiDateParams,
    }),
    [sessionStatus, programId, apiDateParams],
  );

  const activeFilterCount =
    (sessionStatus ? 1 : 0) +
    (programId ? 1 : 0) +
    (apiDateParams.dateFrom && apiDateParams.dateTo ? 1 : 0);

  const query = useInfiniteQuery({
    queryKey: sessionQueryKeys.list('history', listFilters),
    queryFn: ({ pageParam }) =>
      fetchSessionsPage({
        cursor: pageParam,
        limit: DEFAULT_LIST_LIMIT,
        ...listFilters,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore && last.nextCursor ? last.nextCursor : undefined),
    staleTime: 1000 * 30,
  });

  if (query.isError) {
    return (
      <PageContainer>
        <QueryErrorMessage error={query.error} refetch={() => query.refetch()} />
      </PageContainer>
    );
  }

  const items = query.data?.pages.flatMap((p) => p.data) ?? [];
  const hasFilter = activeFilterCount > 0;

  function clearFilters() {
    setSessionStatus('');
    setProgramId('');
    setDatePreset('all');
    setCustomFrom('');
    setCustomTo('');
  }

  return (
    <PageContainer>
      <header className="border-b border-(--border) pb-4">
        <h1 className="text-2xl font-medium text-(--text-h)">Sessions</h1>
      </header>

      <SessionListFiltersBar
        sessionStatus={sessionStatus}
        onSessionStatusChange={setSessionStatus}
        programId={programId}
        onProgramIdChange={setProgramId}
        programOptions={programOptions}
        programsLoading={programsQuery.isPending}
        datePreset={datePreset}
        onDatePresetChange={setDatePreset}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
        onClearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
      />

      {query.isPending ? (
        <p className="text-sm text-(--text)">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState
          title={hasFilter ? 'No matching sessions' : 'No sessions yet'}
          description={
            hasFilter
              ? 'Try clearing filters or widening the date range.'
              : 'Start from a program day, or open the log form to enter details manually.'
          }
          action={
            hasFilter ? undefined : (
              <Link
                to="/sessions/start"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-(--text-h) px-4 text-base font-medium text-(--bg) hover:opacity-90"
              >
                Start workout
              </Link>
            )
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((s) => (
            <li key={s.id}>
              <Link
                to={`/sessions/${s.id}`}
                className="block rounded-xl border border-(--border) bg-(--bg) px-4 py-3 transition-colors hover:bg-(--code-bg)/50"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <span className="font-medium text-(--text-h)">{s.workoutName}</span>
                  <span className={cn(rowMeta, 'shrink-0 sm:text-right')}>
                    {formatSessionWhen(s.datePerformed)}
                  </span>
                </div>
                <p className={cn(rowMeta, 'mt-1 capitalize')}>
                  {formatEnumLabel(s.sessionStatus)} · {Math.round(s.sessionDuration)} min
                  {s.program ? ` · ${s.program.name}` : ''}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {query.hasNextPage ? (
        <Button
          type="button"
          variant="secondary"
          className="self-center"
          disabled={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
        >
          {query.isFetchingNextPage ? 'Loading…' : 'Load more'}
        </Button>
      ) : null}
    </PageContainer>
  );
}
