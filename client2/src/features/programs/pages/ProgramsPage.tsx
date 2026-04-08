import { useInfiniteQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_LIST_LIMIT } from '@/api/pagination';
import { PageContainer } from '@/components/layout/PageContainer';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import type { ProgramListSort } from '../types';
import { fetchProgramsPage, programQueryKeys } from '../api';
import { ProgramAdvancedFiltersDialog } from '../components/ProgramAdvancedFiltersDialog';
import { ProgramListFiltersBar } from '../components/ProgramListFiltersBar';
import { ProgramListPageHeader } from '../components/ProgramListPageHeader';

export function ProgramsPage() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeOnly, setActiveOnly] = useState(false);
  const [advStatus, setAdvStatus] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [goal, setGoal] = useState('');
  const [splitType, setSplitType] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [sort, setSort] = useState<ProgramListSort>('created_desc');

  const statusForApi = activeOnly ? 'active' : advStatus || undefined;

  const query = useInfiniteQuery({
    queryKey: [
      ...programQueryKeys.all,
      'list',
      statusForApi ?? '',
      difficulty,
      goal,
      splitType,
      createdFrom,
      sort,
    ],
    queryFn: ({ pageParam }) =>
      fetchProgramsPage({
        cursor: pageParam,
        limit: DEFAULT_LIST_LIMIT,
        sort,
        ...(statusForApi ? { status: statusForApi } : {}),
        ...(difficulty ? { difficulty } : {}),
        ...(goal ? { goal } : {}),
        ...(splitType ? { splitType } : {}),
        ...(createdFrom ? { createdFrom } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore && last.nextCursor ? last.nextCursor : undefined),
    staleTime: 1000 * 60,
  });

  const advancedCount =
    (difficulty ? 1 : 0) +
    (goal ? 1 : 0) +
    (splitType ? 1 : 0) +
    (createdFrom ? 1 : 0) +
    (!activeOnly && advStatus ? 1 : 0);

  const openAdvanced = () => {
    dialogRef.current?.showModal();
  };

  const pageShellClass = 'gap-4 py-6 sm:gap-6 sm:py-8';

  if (query.isError) {
    return (
      <PageContainer className={pageShellClass}>
        <QueryErrorMessage error={query.error} refetch={() => query.refetch()} />
      </PageContainer>
    );
  }

  const items = query.data?.pages.flatMap((p) => p.data) ?? [];
  const hasFilters = Boolean(
    activeOnly || difficulty || goal || splitType || createdFrom || (!activeOnly && advStatus),
  );

  return (
    <PageContainer className={pageShellClass}>
      <ProgramListPageHeader />

      <ProgramListFiltersBar
        activeOnly={activeOnly}
        onActiveOnlyChange={(on) => {
          setActiveOnly(on);
          if (on) {
            setAdvStatus('');
          }
        }}
        advancedCount={advancedCount}
        onOpenAdvanced={openAdvanced}
        sort={sort}
        onSortChange={setSort}
      />

      <ProgramAdvancedFiltersDialog
        ref={dialogRef}
        activeOnly={activeOnly}
        advStatus={advStatus}
        onAdvStatusChange={setAdvStatus}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        goal={goal}
        onGoalChange={setGoal}
        splitType={splitType}
        onSplitTypeChange={setSplitType}
        createdFrom={createdFrom}
        onCreatedFromChange={setCreatedFrom}
      />

      {query.isPending ? (
        <p className="font-mono-ui text-center text-sm text-(--text)">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No matching programs' : 'No programs yet'}
          description={
            hasFilters
              ? 'Try clearing filters or create a new program.'
              : 'Create a custom program or start from a template.'
          }
          action={
            hasFilters ? undefined : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  to="/programs/new"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-(--text-h) px-4 text-base font-medium text-(--bg) hover:opacity-90"
                >
                  New program
                </Link>
                <Link
                  to="/templates"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-(--border) px-4 text-base font-medium text-(--text-h) hover:bg-(--code-bg)"
                >
                  Browse templates
                </Link>
              </div>
            )
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((p) => (
            <li key={p.id}>
              <Link
                to={`/programs/${p.id}`}
                className="block rounded-xl border border-(--border) bg-(--bg) px-4 py-3 transition-colors hover:bg-(--code-bg)/50"
              >
                <span className="font-medium text-(--text-h)">{p.name}</span>
                <p className="font-mono-ui mt-0.5 text-xs capitalize tracking-tight text-(--text)">
                  {p.status} · {p.goal} · {p.difficulty}
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
