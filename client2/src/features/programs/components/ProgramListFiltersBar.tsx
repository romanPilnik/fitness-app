import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  activeOnly: boolean;
  onActiveOnlyChange: (next: boolean) => void;
  advancedCount: number;
  onOpenAdvanced: () => void;
};

export function ProgramListFiltersBar({
  activeOnly,
  onActiveOnlyChange,
  advancedCount,
  onOpenAdvanced,
}: Props) {
  return (
    <section
      aria-label="Program list filters"
      className="rounded-lg border border-(--border) bg-(--code-bg)/25 px-2 py-2 sm:px-3 sm:py-2.5"
    >
      <span className="sr-only">Filters</span>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        <label className="font-mono-ui flex cursor-pointer items-center gap-1.5 text-xs text-(--text-h) sm:gap-2 sm:text-sm">
          <input
            type="checkbox"
            checked={activeOnly}
            className="size-3.5 rounded border border-(--border) accent-(--accent) sm:size-4"
            onChange={(e) => onActiveOnlyChange(e.target.checked)}
          />
          Active only
        </label>
        <span className="hidden text-(--border) sm:inline" aria-hidden>
          |
        </span>
        <button
          type="button"
          onClick={onOpenAdvanced}
          className={cn(
            'inline-flex min-h-10 items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono-ui text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border) sm:min-h-11 sm:gap-2 sm:px-3 sm:text-sm',
            advancedCount > 0
              ? 'border-(--accent) bg-(--accent-bg) text-(--text-h)'
              : 'border-(--border) bg-(--bg) text-(--text-h) hover:bg-(--code-bg)/50',
          )}
        >
          <SlidersHorizontal className="size-3.5 shrink-0 opacity-80 sm:size-4" aria-hidden />
          <span>Advanced</span>
          {advancedCount > 0 ? (
            <span
              className="flex min-w-4.5 items-center justify-center rounded bg-(--text-h) px-1 py-0.5 text-[10px] font-semibold leading-none text-(--bg)"
              aria-hidden
            >
              {advancedCount}
            </span>
          ) : null}
        </button>
      </div>
    </section>
  );
}
