import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MoreVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_LIST_LIMIT } from '@/api/pagination';
import { useConfirm } from '@/components/ConfirmProvider';
import { PageContainer } from '@/components/layout/PageContainer';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { errorMessageFromUnknown } from '@/lib/utils';
import type { ProgramListSort, ProgramSummary } from '../types';
import {
  deleteProgram,
  fetchNextProgramWorkout,
  fetchProgramsPage,
  programQueryKeys,
} from '../api';
import { ProgramAdvancedFiltersDialog } from '../components/ProgramAdvancedFiltersDialog';
import { ProgramListFiltersBar } from '../components/ProgramListFiltersBar';
import { ProgramListPageHeader } from '../components/ProgramListPageHeader';

export function ProgramsPage() {
  const qc = useQueryClient();
  const confirm = useConfirm();
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

  const delProgram = useMutation({
    mutationFn: deleteProgram,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: programQueryKeys.all });
    },
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
          description={hasFilters ? 'Try clearing filters or create a new program.' : undefined}
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
              <ProgramListItem
                program={p}
                isDeletePending={delProgram.isPending && delProgram.variables === p.id}
                onDelete={async () => {
                  const ok = await confirm('Delete this program permanently?', {
                    confirmLabel: 'Delete',
                    cancelLabel: 'Cancel',
                  });
                  if (ok) delProgram.mutate(p.id);
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {delProgram.isError ? (
        <p className="text-center text-sm text-red-600" role="alert">
          {errorMessageFromUnknown(delProgram.error)}
        </p>
      ) : null}

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

function ProgramListItem({
  program: p,
  isDeletePending,
  onDelete,
}: {
  program: ProgramSummary;
  isDeletePending: boolean;
  onDelete: () => void | Promise<void>;
}) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const nextQ = useQuery({
    queryKey: programQueryKeys.nextWorkout(p.id, timeZone),
    queryFn: () => fetchNextProgramWorkout(p.id, timeZone),
    staleTime: 30_000,
  });
  const startBase = `/sessions/start?programId=${encodeURIComponent(p.id)}`;
  const next = nextQ.data;
  const startNextHref = next
    ? `${startBase}&programWorkoutId=${encodeURIComponent(next.programWorkoutId)}&occurrenceId=${encodeURIComponent(next.id)}`
    : startBase;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <div className="flex min-w-0 gap-2 rounded-xl border border-(--border) bg-(--bg) p-3 transition-colors hover:bg-(--code-bg)/50 sm:items-center">
      <Link to={`/programs/${p.id}`} className="min-w-0 flex-1">
        <span className="font-medium text-(--text-h)">{p.name}</span>
        <p className="font-mono-ui mt-0.5 text-xs capitalize tracking-tight text-(--text)">
          {p.status} · {p.goal} · {p.difficulty}
        </p>
      </Link>
      <div className="relative shrink-0 self-start sm:self-center" ref={menuRef}>
        <button
          type="button"
          aria-label={`Program options: ${p.name}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          disabled={isDeletePending}
          className="inline-flex size-11 items-center justify-center rounded-lg border border-(--border) text-(--text-h) transition-colors hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border) disabled:pointer-events-none disabled:opacity-50"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <MoreVertical className="size-4" strokeWidth={2.25} aria-hidden />
        </button>
        {menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-1 min-w-50 rounded-lg border border-(--border) bg-(--bg) py-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10"
          >
            <Link
              role="menuitem"
              to={startNextHref}
              className="block px-3 py-2.5 text-sm text-(--text-h) hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-inset"
              onClick={() => setMenuOpen(false)}
            >
              Start next workout
            </Link>
            <Link
              role="menuitem"
              to={`/programs/${p.id}`}
              className="block px-3 py-2.5 text-sm text-(--text-h) hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-inset"
              onClick={() => setMenuOpen(false)}
            >
              View program
            </Link>
            <Link
              role="menuitem"
              to={`/programs/${p.id}/edit`}
              className="block px-3 py-2.5 text-sm text-(--text-h) hover:bg-(--code-bg) focus-visible:outline-2 focus-visible:outline-inset"
              onClick={() => setMenuOpen(false)}
            >
              Edit program
            </Link>
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-inset dark:text-red-400"
              onClick={async () => {
                setMenuOpen(false);
                await onDelete();
              }}
            >
              Delete program
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
