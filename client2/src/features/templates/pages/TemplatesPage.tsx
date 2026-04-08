import { Plus } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DEFAULT_LIST_LIMIT } from '@/api/pagination';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import { useAuth } from '@/features/auth/useAuth';
import { isFromLibraryState, libraryLocationState } from '@/lib/libraryNav';
import { fetchTemplatesPage, templateQueryKeys } from '../api';

export function TemplatesPage() {
  const location = useLocation();
  const fromLibrary = isFromLibraryState(location.state);
  const { isAuthenticated } = useAuth();
  const [mineOnly, setMineOnly] = useState(false);
  const listScope = mineOnly ? 'mine' : 'all';

  const query = useInfiniteQuery({
    queryKey: templateQueryKeys.list(listScope),
    queryFn: ({ pageParam }) =>
      fetchTemplatesPage({
        cursor: pageParam,
        limit: DEFAULT_LIST_LIMIT,
        myTemplatesOnly: mineOnly || undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore && last.nextCursor ? last.nextCursor : undefined),
    staleTime: 1000 * 60 * 5,
  });

  if (query.isError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <QueryErrorMessage error={query.error} refetch={() => query.refetch()} />
      </div>
    );
  }

  const items = query.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <>
      {fromLibrary ? (
        <SubpageHeader fallbackTo="/library" title="Templates" backLabel="Back to library" />
      ) : null}
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-3 border-b border-(--border) pb-4">
        {!fromLibrary ? <h1 className="text-2xl font-medium text-(--text-h)">Templates</h1> : null}
        <p className="text-sm text-(--text)">Browse program templates you can start from later.</p>
        <div className="flex flex-wrap items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/templates/new"
                {...(fromLibrary ? { state: libraryLocationState } : {})}
                aria-label="New template"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-(--text-h) text-(--bg) shadow-(--shadow) transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
              >
                <Plus className="size-5" aria-hidden />
              </Link>
              <label className="flex items-center gap-2 text-sm text-(--text)">
                <input
                  type="checkbox"
                  checked={mineOnly}
                  onChange={(e) => setMineOnly(e.target.checked)}
                  className="size-4 rounded border-(--border)"
                />
                My templates only
              </label>
            </>
          ) : null}
        </div>
      </header>

      {query.isPending ? (
        <p className="text-sm text-(--text)">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState title="No templates" description="Nothing to show yet." />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((t) => (
            <li key={t.id}>
              <Link
                to={`/templates/${t.id}`}
                {...(fromLibrary ? { state: libraryLocationState } : {})}
                className="block rounded-xl border border-(--border) bg-(--bg) px-4 py-3 transition-colors hover:bg-(--code-bg)/50"
              >
                <span className="font-medium text-(--text-h)">{t.name}</span>
                <p className="mt-0.5 text-sm text-(--text)">
                  {t.daysPerWeek} days · {t.difficulty} · {t.goal}
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
      </div>
    </>
  );
}
