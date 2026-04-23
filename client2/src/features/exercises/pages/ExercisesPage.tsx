import { useQueries } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import {
  EQUIPMENT_VALUES,
  EXERCISE_CATEGORY_VALUES,
  MOVEMENT_PATTERN_VALUES,
  MUSCLE_GROUP_VALUES,
} from '@/lib/apiFilterOptions';
import { formatEnumLabel } from '@/lib/formatEnumLabel';
import { isFromLibraryState, libraryLocationState } from '@/lib/libraryNav';
import { useCurrentUser } from '@/features/users/useCurrentUser';
import { exerciseQueryKeys, fetchExercisesPage } from '../api';
import { ExerciseListFiltersBar } from '../components/ExerciseListFiltersBar';
import { ExerciseMuscleGroupSection } from '../components/ExerciseMuscleGroupSection';
import type { ExerciseListSort } from '../types';

const selectClass =
  'min-h-11 w-full rounded-lg border border-(--border) bg-(--bg) px-3 py-2 text-sm text-(--text-h)';

export function ExercisesPage() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const location = useLocation();
  const fromLibrary = isFromLibraryState(location.state);
  const exerciseLinkState = fromLibrary ? libraryLocationState : undefined;
  const me = useCurrentUser();
  const [sort, setSort] = useState<ExerciseListSort>('name_asc');
  const [equipment, setEquipment] = useState('');
  const [category, setCategory] = useState('');
  const [movementPattern, setMovementPattern] = useState('');

  const advancedCount =
    (equipment ? 1 : 0) + (category ? 1 : 0) + (movementPattern ? 1 : 0);

  const openAdvanced = () => {
    dialogRef.current?.showModal();
  };

  const filterEquipment = equipment || undefined;
  const filterCategory = category || undefined;
  const filterMovement = movementPattern || undefined;

  const hasAdvancedFilters = advancedCount > 0;

  const groupProbeQueries = useQueries({
    queries: MUSCLE_GROUP_VALUES.map((muscle) => ({
      queryKey: [
        ...exerciseQueryKeys.all,
        'group-probe',
        muscle,
        filterEquipment ?? '',
        filterCategory ?? '',
        filterMovement ?? '',
        sort,
      ] as const,
      queryFn: () =>
        fetchExercisesPage({
          primaryMuscle: muscle,
          limit: 1,
          sort,
          ...(filterEquipment ? { equipment: filterEquipment } : {}),
          ...(filterCategory ? { category: filterCategory } : {}),
          ...(filterMovement ? { movementPattern: filterMovement } : {}),
        }),
      enabled: hasAdvancedFilters,
      staleTime: 1000 * 60 * 5,
    })),
  });

  const isProbeLoading =
    hasAdvancedFilters && groupProbeQueries.some((q) => q.isPending);

  const musclesToRender = !hasAdvancedFilters
    ? MUSCLE_GROUP_VALUES
    : MUSCLE_GROUP_VALUES.filter((_, i) => {
        const q = groupProbeQueries[i]!;
        if (q.isError) return true;
        return (q.data?.data.length ?? 0) > 0;
      });

  const onlyOneGroupVisible = hasAdvancedFilters && musclesToRender.length === 1;
  const sectionKeySuffix = [filterEquipment ?? '', filterCategory ?? '', filterMovement ?? '', sort].join(
    '|',
  );

  return (
    <>
      {fromLibrary ? (
        <SubpageHeader
          fallbackTo="/library"
          title="Exercises"
          backLabel="Back to library"
          trailingAction={
            <Link
              to="/exercises/new"
              {...(exerciseLinkState ? { state: exerciseLinkState } : {})}
              aria-label="New exercise"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-(--text-h) text-(--bg) shadow-(--shadow) transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
            >
              <Plus className="size-5" aria-hidden />
            </Link>
          }
        />
      ) : null}
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      {me.isError ? (
        <QueryErrorMessage error={me.error} refetch={() => me.refetch()} />
      ) : null}

      <header className="flex flex-col gap-4 border-b border-(--border) pb-4">
        {!fromLibrary ? <h1 className="text-2xl font-medium text-(--text-h)">Exercises</h1> : null}

        <div
          className={
            fromLibrary
              ? 'flex flex-col gap-3'
              : 'flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3'
          }
        >
          <ExerciseListFiltersBar
            className="min-w-0 flex-1"
            sort={sort}
            onSortChange={setSort}
            advancedCount={advancedCount}
            onOpenAdvanced={openAdvanced}
          />
          {fromLibrary ? null : (
            <Link
              to="/exercises/new"
              {...(exerciseLinkState ? { state: exerciseLinkState } : {})}
              aria-label="New exercise"
              className="inline-flex size-11 shrink-0 items-center justify-center self-end rounded-lg bg-(--text-h) text-(--bg) shadow-(--shadow) transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border) sm:self-center"
            >
              <Plus className="size-5" aria-hidden />
            </Link>
          )}
        </div>
      </header>

      <dialog
        ref={dialogRef}
        className="w-[calc(100%-2rem)] max-w-md rounded-xl border border-(--border) bg-(--bg) p-0 text-(--text) shadow-lg backdrop:bg-black/40"
      >
        <div className="border-b border-(--border) px-4 py-3">
          <h2 className="text-base font-medium text-(--text-h)">Advanced</h2>
          <p className="mt-0.5 text-xs text-(--text)">
            Equipment, category, and movement apply to every muscle group below. Sorting is
            per-group from the bar above.
          </p>
        </div>
        <div className="flex max-h-[min(70vh,420px)] flex-col gap-3 overflow-y-auto p-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-(--text)">Equipment</span>
            <select
              className={selectClass}
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
            >
              <option value="">All</option>
              {EQUIPMENT_VALUES.map((v) => (
                <option key={v} value={v}>
                  {formatEnumLabel(v)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-(--text)">Category</span>
            <select
              className={selectClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All</option>
              {EXERCISE_CATEGORY_VALUES.map((v) => (
                <option key={v} value={v}>
                  {formatEnumLabel(v)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-(--text)">Movement pattern</span>
            <select
              className={selectClass}
              value={movementPattern}
              onChange={(e) => setMovementPattern(e.target.value)}
            >
              <option value="">All</option>
              {MOVEMENT_PATTERN_VALUES.map((v) => (
                <option key={v} value={v}>
                  {formatEnumLabel(v)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-(--border) px-4 py-3">
          <form method="dialog">
            <Button type="submit" variant="secondary">
              Close
            </Button>
          </form>
        </div>
      </dialog>

      <div className="flex flex-col gap-2">
        {isProbeLoading ? (
          <p className="text-sm text-(--text)">Loading exercise groups…</p>
        ) : hasAdvancedFilters && musclesToRender.length === 0 ? (
          <p className="text-sm text-(--text)">No exercises match the current filters.</p>
        ) : (
          musclesToRender.map((muscle) => (
            <ExerciseMuscleGroupSection
              key={`${muscle}-${sectionKeySuffix}`}
              muscle={muscle}
              sort={sort}
              defaultOpen={onlyOneGroupVisible}
              {...(exerciseLinkState ? { linkState: exerciseLinkState } : {})}
              {...(filterEquipment ? { equipment: filterEquipment } : {})}
              {...(filterCategory ? { category: filterCategory } : {})}
              {...(filterMovement ? { movementPattern: filterMovement } : {})}
            />
          ))
        )}
      </div>
      </div>
    </>
  );
}
