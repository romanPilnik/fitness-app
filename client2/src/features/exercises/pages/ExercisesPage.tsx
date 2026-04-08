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
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/features/users/useCurrentUser';
import { ExerciseMuscleGroupSection } from '../components/ExerciseMuscleGroupSection';

const selectClass =
  'min-h-11 w-full rounded-lg border border-(--border) bg-(--bg) px-3 py-2 text-sm text-(--text-h)';

export function ExercisesPage() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const location = useLocation();
  const fromLibrary = isFromLibraryState(location.state);
  const exerciseLinkState = fromLibrary ? libraryLocationState : undefined;
  const me = useCurrentUser();
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

  return (
    <>
      {fromLibrary ? (
        <SubpageHeader fallbackTo="/library" title="Exercises" backLabel="Back to library" />
      ) : null}
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      {me.isError ? (
        <QueryErrorMessage error={me.error} refetch={() => me.refetch()} />
      ) : null}

      <header className="flex flex-col gap-4 border-b border-(--border) pb-4">
        {!fromLibrary ? <h1 className="text-2xl font-medium text-(--text-h)">Exercises</h1> : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={openAdvanced}
            className={cn(
              'inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)',
              advancedCount > 0
                ? 'border-(--accent) bg-(--code-bg)/40 text-(--text-h)'
                : 'border-(--border) bg-transparent text-(--text-h) hover:bg-(--code-bg)/50',
            )}
          >
            Advanced filters
            {advancedCount > 0 ? (
              <span
                className="flex size-5 items-center justify-center rounded-full bg-(--text-h) text-[10px] font-semibold text-(--bg)"
                aria-hidden
              >
                {advancedCount}
              </span>
            ) : null}
          </button>
          <Link
            to="/exercises/new"
            {...(exerciseLinkState ? { state: exerciseLinkState } : {})}
            aria-label="New exercise"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-(--text-h) text-(--bg) shadow-(--shadow) transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
          >
            <Plus className="size-5" aria-hidden />
          </Link>
        </div>
      </header>

      <dialog
        ref={dialogRef}
        className="w-[calc(100%-2rem)] max-w-md rounded-xl border border-(--border) bg-(--bg) p-0 text-(--text) shadow-lg backdrop:bg-black/40"
      >
        <div className="border-b border-(--border) px-4 py-3">
          <h2 className="text-base font-medium text-(--text-h)">Advanced filters</h2>
          <p className="mt-0.5 text-xs text-(--text)">
            Filters apply to every muscle group below.
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
        {MUSCLE_GROUP_VALUES.map((muscle) => (
          <ExerciseMuscleGroupSection
            key={muscle}
            muscle={muscle}
            {...(exerciseLinkState ? { linkState: exerciseLinkState } : {})}
            {...(filterEquipment ? { equipment: filterEquipment } : {})}
            {...(filterCategory ? { category: filterCategory } : {})}
            {...(filterMovement ? { movementPattern: filterMovement } : {})}
          />
        ))}
      </div>
      </div>
    </>
  );
}
