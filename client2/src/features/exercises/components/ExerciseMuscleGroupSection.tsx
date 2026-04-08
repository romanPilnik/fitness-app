import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatEnumLabel } from '@/lib/formatEnumLabel';
import { exerciseQueryKeys, fetchExercisesPage } from '../api';

const GROUP_LIMIT = 80;

type Props = {
  muscle: string;
  equipment?: string;
  category?: string;
  movementPattern?: string;
};

export function ExerciseMuscleGroupSection({
  muscle,
  equipment,
  category,
  movementPattern,
}: Props) {
  const query = useInfiniteQuery({
    queryKey: [
      ...exerciseQueryKeys.all,
      'group',
      muscle,
      equipment ?? '',
      category ?? '',
      movementPattern ?? '',
    ],
    queryFn: ({ pageParam }) =>
      fetchExercisesPage({
        cursor: pageParam,
        limit: GROUP_LIMIT,
        primaryMuscle: muscle,
        ...(equipment ? { equipment } : {}),
        ...(category ? { category } : {}),
        ...(movementPattern ? { movementPattern } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore && last.nextCursor ? last.nextCursor : undefined),
    staleTime: 1000 * 60 * 5,
  });

  const items = useMemo(() => {
    const flat = query.data?.pages.flatMap((p) => p.data) ?? [];
    return [...flat].sort((a, b) => a.name.localeCompare(b.name));
  }, [query.data]);

  const countLabel = query.isPending
    ? '…'
    : query.hasNextPage && items.length > 0
      ? `${items.length}+`
      : String(items.length);

  return (
    <details className="rounded-xl border border-(--border) bg-(--bg)">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-(--text-h) [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 font-medium">
          {formatEnumLabel(muscle)}{' '}
          <span className="font-normal text-(--text)">({countLabel})</span>
        </span>
        <ChevronDown className="size-5 shrink-0 text-(--text)" aria-hidden />
      </summary>
      <div className="border-t border-(--border) px-2 pb-3 pt-1">
        {query.isError ? (
          <p className="px-2 py-2 text-sm text-red-600" role="alert">
            Could not load this group.
          </p>
        ) : query.isPending ? (
          <p className="px-2 py-2 text-sm text-(--text)">Loading…</p>
        ) : items.length === 0 ? (
          <p className="px-2 py-2 text-sm text-(--text)">No exercises in this group.</p>
        ) : (
          <>
            <ul className="flex flex-col gap-1">
              {items.map((ex) => (
                <li key={ex.id}>
                  <Link
                    to={`/exercises/${ex.id}`}
                    className="flex min-h-11 items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-(--code-bg)/50"
                  >
                    <span className="min-w-0 flex-1 font-medium text-(--text-h)">{ex.name}</span>
                    <span className="shrink-0 text-xs text-(--text)">
                      {formatEnumLabel(ex.equipment)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {query.hasNextPage ? (
              <Button
                type="button"
                variant="secondary"
                className="mt-2 w-full"
                disabled={query.isFetchingNextPage}
                onClick={() => query.fetchNextPage()}
              >
                {query.isFetchingNextPage ? 'Loading…' : 'Load more in this group'}
              </Button>
            ) : null}
          </>
        )}
      </div>
    </details>
  );
}
