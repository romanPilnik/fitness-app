import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_LIST_LIMIT } from '@/api/pagination';
import { SESSION_STATUS_VALUES } from '@/lib/apiFilterOptions';
import { formatEnumLabel } from '@/lib/formatEnumLabel';
import { PageContainer } from '@/components/layout/PageContainer';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FILTER_SELECT_CLASS } from '@/lib/nativeSelect';
import { cn } from '@/lib/utils';
import { fetchSessionsPage, sessionQueryKeys } from '../api';

const selectClass = cn(FILTER_SELECT_CLASS, 'max-w-xs');

export function SessionsPage() {
  const [sessionStatus, setSessionStatus] = useState('');

  const query = useInfiniteQuery({
    queryKey: [...sessionQueryKeys.list('history'), sessionStatus],
    queryFn: ({ pageParam }) =>
      fetchSessionsPage({
        cursor: pageParam,
        limit: DEFAULT_LIST_LIMIT,
        ...(sessionStatus ? { sessionStatus } : {}),
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
  const hasFilter = Boolean(sessionStatus);

  return (
    <PageContainer>
      <header className="flex flex-col gap-3 border-b border-(--border) pb-4">
        <h1 className="text-2xl font-medium text-(--text-h)">Sessions</h1>
        <p className="text-sm text-(--text)">Your logged workouts, newest first.</p>
        <Link
          to="/sessions/start"
          className="inline-flex min-h-11 max-w-fit items-center justify-center rounded-lg bg-(--text-h) px-4 text-base font-medium text-(--bg) hover:opacity-90"
        >
          Log workout
        </Link>
      </header>

      <section className="flex flex-col gap-2 rounded-xl border border-(--border) bg-(--bg) p-4">
        <h2 className="text-sm font-medium text-(--text-h)">Filters</h2>
        <label className="flex max-w-xs flex-col gap-1 text-sm">
          <span className="text-(--text)">Status</span>
          <select
            className={selectClass}
            value={sessionStatus}
            onChange={(e) => setSessionStatus(e.target.value)}
          >
            <option value="">All</option>
            {SESSION_STATUS_VALUES.map((v) => (
              <option key={v} value={v}>
                {formatEnumLabel(v)}
              </option>
            ))}
          </select>
        </label>
      </section>

      {query.isPending ? (
        <p className="text-sm text-(--text)">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState
          title={hasFilter ? 'No matching sessions' : 'No sessions yet'}
          description={
            hasFilter
              ? 'Try clearing the status filter.'
              : 'Start from a program day with “Log workout”, or open the log form to enter details manually.'
          }
          action={
            hasFilter ? undefined : (
              <Link
                to="/sessions/start"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-(--text-h) px-4 text-base font-medium text-(--bg) hover:opacity-90"
              >
                Log workout
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
                <span className="font-medium text-(--text-h)">{s.workoutName}</span>
                <p className="mt-0.5 text-sm capitalize text-(--text)">
                  {new Date(s.datePerformed).toLocaleString()} · {s.sessionStatus} ·{' '}
                  {Math.round(s.sessionDuration)} min
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
