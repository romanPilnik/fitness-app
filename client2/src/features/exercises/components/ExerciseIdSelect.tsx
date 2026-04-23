import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { DEFAULT_LIST_LIMIT } from '@/api/pagination';
import { Button } from '@/components/ui/button';
import { exerciseQueryKeys, fetchExerciseById, fetchExercisesPage } from '../api';

type Props = {
  id: string;
  value: string;
  onChange: (exerciseId: string) => void;
  disabled?: boolean;
};

export function ExerciseIdSelect({ id, value, onChange, disabled }: Props) {
  const q = useInfiniteQuery({
    queryKey: [...exerciseQueryKeys.all, 'list', 'name_asc', 'paged'] as const,
    queryFn: ({ pageParam }) =>
      fetchExercisesPage({
        cursor: pageParam,
        limit: DEFAULT_LIST_LIMIT,
        sort: 'name_asc',
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore && last.nextCursor ? last.nextCursor : undefined),
    staleTime: 60_000,
  });

  const items = useMemo(() => q.data?.pages.flatMap((p) => p.data) ?? [], [q.data]);
  const inList = value ? items.some((ex) => ex.id === value) : true;

  const detailQ = useQuery({
    queryKey: exerciseQueryKeys.detail(value),
    queryFn: () => fetchExerciseById(value),
    enabled: Boolean(value) && !inList && !q.isPending,
    staleTime: 60_000,
  });

  const options = useMemo(() => {
    if (!value || inList) return items;
    const d = detailQ.data;
    if (d) return [...items, d];
    return items;
  }, [items, value, inList, detailQ.data]);

  return (
    <div className="flex flex-col gap-2">
      <select
        id={id}
        disabled={disabled || q.isPending || (Boolean(value) && !inList && detailQ.isPending)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base text-(--text)"
      >
        <option value="">{q.isPending ? 'Loading…' : 'Select exercise'}</option>
        {options.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>
      {q.hasNextPage ? (
        <Button
          type="button"
          variant="secondary"
          className="self-start"
          disabled={q.isFetchingNextPage}
          onClick={() => q.fetchNextPage()}
        >
          {q.isFetchingNextPage ? 'Loading…' : 'Load more exercises'}
        </Button>
      ) : null}
    </div>
  );
}
