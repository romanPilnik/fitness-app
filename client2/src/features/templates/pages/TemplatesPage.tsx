import { Link2, Plus } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DEFAULT_LIST_LIMIT } from '@/api/pagination';
import { PageContainer } from '@/components/layout/PageContainer';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import { useAuth } from '@/features/auth/useAuth';
import { isFromLibraryState, libraryLocationState } from '@/lib/libraryNav';
import type { TemplateListSort } from '../types';
import { fetchTemplatesPage, templateQueryKeys } from '../api';
import { TemplateAdvancedFiltersDialog } from '../components/TemplateAdvancedFiltersDialog';
import { TemplateListFiltersBar } from '../components/TemplateListFiltersBar';

function TemplatesPageHeader({
  fromLibrary,
  isAuthenticated,
}: {
  fromLibrary: boolean;
  isAuthenticated: boolean;
}) {
  const showTitle = !fromLibrary;
  const showNewInPageHeader = isAuthenticated && !fromLibrary;

  if (!showTitle && !showNewInPageHeader) {
    return null;
  }

  return (
    <header className="border-b border-(--border) pb-3 sm:pb-4">
      <div
        className={
          showTitle
            ? 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6'
            : 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'
        }
      >
        {showTitle ? (
          <div className="min-w-0 border-l-2 border-(--accent) pl-3 sm:pl-4">
            <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-(--text-h) sm:text-4xl">
              Templates
            </h1>
          </div>
        ) : null}
        {showNewInPageHeader ? (
          <Link
            to="/templates/new"
            aria-label="New template"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--text-h) text-(--bg) shadow-(--shadow) transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border) sm:size-11"
          >
            <Plus className="size-4.5 sm:size-5" aria-hidden />
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export function TemplatesPage() {
  const location = useLocation();
  const fromLibrary = isFromLibraryState(location.state);
  const { isAuthenticated } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mineOnly, setMineOnly] = useState(false);
  const [sort, setSort] = useState<TemplateListSort>('created_desc');
  const [difficulty, setDifficulty] = useState('');
  const [goal, setGoal] = useState('');
  const [splitType, setSplitType] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('');

  const listScope = mineOnly ? 'mine' : 'all';
  const daysPerWeekForApi = daysPerWeek ? Number(daysPerWeek) : undefined;

  const query = useInfiniteQuery({
    queryKey: templateQueryKeys.list(
      listScope,
      sort,
      difficulty,
      goal,
      splitType,
      daysPerWeek || '',
    ),
    queryFn: ({ pageParam }) =>
      fetchTemplatesPage({
        cursor: pageParam,
        limit: DEFAULT_LIST_LIMIT,
        sort,
        myTemplatesOnly: mineOnly || undefined,
        ...(difficulty ? { difficulty } : {}),
        ...(goal ? { goal } : {}),
        ...(splitType ? { splitType } : {}),
        ...(daysPerWeekForApi != null ? { daysPerWeek: daysPerWeekForApi } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore && last.nextCursor ? last.nextCursor : undefined),
    staleTime: 1000 * 60 * 5,
  });

  const advancedCount =
    (difficulty ? 1 : 0) + (goal ? 1 : 0) + (splitType ? 1 : 0) + (daysPerWeek ? 1 : 0);

  const openAdvanced = () => {
    dialogRef.current?.showModal();
  };

  const pageShellClass = 'gap-4 py-6 sm:gap-6 sm:py-8';

  const hasFilters = Boolean(
    mineOnly ||
      difficulty ||
      goal ||
      splitType ||
      daysPerWeek ||
      sort !== 'created_desc',
  );

  const newTemplateSubpageAction =
    isAuthenticated && fromLibrary ? (
      <Link
        to="/templates/new"
        state={libraryLocationState}
        aria-label="New template"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--text-h) text-(--bg) shadow-(--shadow) transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border) sm:size-11"
      >
        <Plus className="size-4.5 sm:size-5" aria-hidden />
      </Link>
    ) : undefined;

  if (query.isError) {
    return (
      <>
        {fromLibrary ? (
          <SubpageHeader
            fallbackTo="/library"
            title="Templates"
            backLabel="Back to library"
            trailingAction={newTemplateSubpageAction}
          />
        ) : null}
        <PageContainer className={pageShellClass}>
          <QueryErrorMessage error={query.error} refetch={() => query.refetch()} />
        </PageContainer>
      </>
    );
  }

  const items = query.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <>
      {fromLibrary ? (
        <SubpageHeader
          fallbackTo="/library"
          title="Templates"
          backLabel="Back to library"
          trailingAction={newTemplateSubpageAction}
        />
      ) : null}
      <PageContainer className={pageShellClass}>
        <TemplatesPageHeader fromLibrary={fromLibrary} isAuthenticated={isAuthenticated} />

        <TemplateListFiltersBar
          showMineToggle={isAuthenticated}
          mineOnly={mineOnly}
          onMineOnlyChange={setMineOnly}
          advancedCount={advancedCount}
          onOpenAdvanced={openAdvanced}
          sort={sort}
          onSortChange={setSort}
        />

        <TemplateAdvancedFiltersDialog
          ref={dialogRef}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          goal={goal}
          onGoalChange={setGoal}
          splitType={splitType}
          onSplitTypeChange={setSplitType}
          daysPerWeek={daysPerWeek}
          onDaysPerWeekChange={setDaysPerWeek}
        />

        {query.isPending ? (
          <p className="font-mono-ui text-center text-sm text-(--text)">Loading…</p>
        ) : items.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No matching templates' : 'No templates'}
            description={
              hasFilters
                ? 'Try clearing filters or create a new template.'
                : 'Nothing to show yet.'
            }
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((t) => (
              <li key={t.id}>
                <Link
                  to={`/templates/${t.id}`}
                  {...(fromLibrary ? { state: libraryLocationState } : {})}
                  className="block rounded-xl border border-(--border) bg-(--bg) px-4 py-3 transition-colors hover:bg-(--code-bg)/50"
                >
                  <div className="flex min-w-0 items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-(--text-h)">{t.name}</span>
                      {t.hasProgramFromTemplate ? (
                        <span className="sr-only">
                          You have a program built from this template.
                        </span>
                      ) : null}
                      <p className="mt-0.5 text-sm text-(--text)">
                        {t.daysPerWeek} days · {t.difficulty} · {t.goal}
                      </p>
                    </div>
                    {t.hasProgramFromTemplate ? (
                      <span
                        className="mt-0.5 shrink-0 text-(--accent)"
                        title="You have a program built from this template"
                      >
                        <Link2 className="size-4" aria-hidden />
                      </span>
                    ) : null}
                  </div>
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
    </>
  );
}
