import { SlidersHorizontal } from 'lucide-react';
import type { ProgramListSort } from '@/features/programs/types';
import { cn } from '@/lib/utils';

const SORT_OPTIONS: { value: ProgramListSort; label: string }[] = [
  { value: 'created_desc', label: 'Recently created' },
  { value: 'created_asc', label: 'Oldest created' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'name_desc', label: 'Name Z–A' },
];

/** Shared shell for sort select + toggle buttons in this bar */
const controlShell =
  'inline-flex min-h-11 w-full min-w-0 shrink-0 items-center justify-center rounded-md border px-2.5 font-mono-ui text-sm leading-none text-(--text-h) transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border) sm:w-auto sm:px-3';

const controlIdle = 'border-(--border) bg-(--bg) hover:bg-(--code-bg)/50';

const controlActive = 'border-(--accent) bg-(--accent-bg)';

type Props = {
  activeOnly: boolean;
  onActiveOnlyChange: (next: boolean) => void;
  advancedCount: number;
  onOpenAdvanced: () => void;
  sort: ProgramListSort;
  onSortChange: (next: ProgramListSort) => void;
};

export function ProgramListFiltersBar({
  activeOnly,
  onActiveOnlyChange,
  advancedCount,
  onOpenAdvanced,
  sort,
  onSortChange,
}: Props) {
  return (
    <section
      aria-label="Program list filters"
      className="w-full min-w-0 rounded-lg border border-(--border) bg-(--code-bg)/25 px-2 py-2 sm:px-3 sm:py-2.5"
    >
      <span className="sr-only">Filters</span>
      {/* Mobile: stack so nothing clips; sm+: one row */}
      <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-stretch sm:gap-3">
        <div className="flex w-full min-w-0 flex-col gap-1.5 sm:w-auto sm:min-w-44 sm:shrink-0 sm:flex-row sm:items-center sm:gap-2">
          <span className="whitespace-nowrap text-xs font-medium text-(--text) sm:text-sm">Sort</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as ProgramListSort)}
            className={cn(controlShell, controlIdle, 'cursor-pointer py-2 sm:min-w-44')}
            aria-label="Sort programs"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex w-full min-w-0 flex-row gap-2 sm:w-auto sm:shrink-0 sm:gap-3">
          <button
            type="button"
            aria-pressed={activeOnly}
            onClick={() => onActiveOnlyChange(!activeOnly)}
            className={cn(
              controlShell,
              'min-w-0 flex-1 whitespace-nowrap sm:flex-initial',
              activeOnly ? controlActive : controlIdle,
            )}
          >
            Active only
          </button>

          <button
            type="button"
            onClick={onOpenAdvanced}
            className={cn(
              controlShell,
              'min-w-0 flex-1 gap-1.5 sm:flex-initial sm:gap-2',
              advancedCount > 0 ? controlActive : controlIdle,
            )}
          >
            <SlidersHorizontal className="size-4 shrink-0 opacity-80" aria-hidden />
            <span>Advanced</span>
            {advancedCount > 0 ? (
              <span
                className="flex min-w-5 items-center justify-center rounded bg-(--text-h) px-1.5 py-0.5 text-xs font-semibold leading-none text-(--bg)"
                aria-hidden
              >
                {advancedCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </section>
  );
}
