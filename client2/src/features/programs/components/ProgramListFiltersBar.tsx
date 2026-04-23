import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { ProgramListSort } from '@/features/programs/types';
import { cn } from '@/lib/utils';

const SORT_OPTIONS: { value: ProgramListSort; label: string }[] = [
  { value: 'created_desc', label: 'Recently created' },
  { value: 'created_asc', label: 'Oldest created' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'name_desc', label: 'Name Z–A' },
];

const controlShell =
  'inline-flex min-h-11 w-full min-w-0 shrink-0 items-center justify-center rounded-md border px-2.5 font-mono-ui text-sm leading-none text-(--text-h) transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border) sm:w-auto sm:px-3';

const controlIdle = 'border-(--border) bg-(--bg) hover:bg-(--code-bg)/50';

const controlActive = 'border-(--accent) bg-(--accent-bg)';

/** Sort trigger + options only — mobile-first tap targets and spacing */
const sortTriggerBase =
  'w-full cursor-pointer touch-manipulation justify-between gap-3 bg-(--bg) px-3 py-3 text-left text-base leading-snug sm:min-h-11 sm:gap-2 sm:py-2 sm:text-sm';

const sortOptionBase =
  'w-full touch-manipulation justify-start text-left text-base leading-snug sm:min-h-11 sm:text-sm';

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
  const [sortOpen, setSortOpen] = useState(false);
  const sortPanelId = useId();
  const sortWrapRef = useRef<HTMLDivElement>(null);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? '';

  useEffect(() => {
    if (!sortOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (sortWrapRef.current?.contains(e.target as Node)) return;
      setSortOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [sortOpen]);

  return (
    <section
      aria-label="Program list filters"
      className="w-full min-w-0 rounded-lg border border-(--border) bg-(--code-bg)/25 px-2 py-2 sm:px-3 sm:py-2.5"
    >
      <span className="sr-only">Filters</span>
      <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-stretch sm:gap-3">
        <div
          ref={sortWrapRef}
          className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:min-w-44 sm:shrink-0 sm:flex-row sm:items-start sm:gap-3"
        >
          <span
            className="shrink-0 text-xs font-semibold uppercase tracking-wide text-(--text)/80 sm:flex sm:min-h-11 sm:items-center sm:text-sm sm:font-medium sm:normal-case sm:tracking-normal sm:text-(--text)"
            id={`${sortPanelId}-legend`}
          >
            Sort
          </span>
          <div className="relative w-full min-w-0 sm:w-auto sm:min-w-44">
            <button
              type="button"
              id={`${sortPanelId}-trigger`}
              aria-expanded={sortOpen}
              aria-controls={sortPanelId}
              aria-describedby={`${sortPanelId}-legend`}
              onClick={() => setSortOpen((o) => !o)}
              className={cn(
                controlShell,
                controlIdle,
                sortTriggerBase,
                'min-h-12 active:bg-(--code-bg)/60 sm:min-h-11 sm:px-3 sm:active:bg-(--code-bg)/50',
              )}
            >
              <span className="min-w-0 flex-1 text-pretty">{currentSortLabel}</span>
              <ChevronDown
                className={cn(
                  'size-5 shrink-0 text-(--text) opacity-80 transition-transform duration-200 sm:size-4',
                  sortOpen && 'rotate-180',
                )}
                aria-hidden
              />
            </button>

            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
                sortOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div
                  id={sortPanelId}
                  role="radiogroup"
                  aria-label="Sort programs"
                  className={cn(
                    'flex flex-col gap-2 sm:gap-1.5',
                    sortOpen &&
                      'mt-2 rounded-xl border border-(--border) bg-(--bg) p-2 shadow-sm sm:mt-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:pt-2 sm:shadow-none',
                  )}
                >
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={sort === o.value}
                      onClick={() => {
                        onSortChange(o.value);
                        setSortOpen(false);
                      }}
                      className={cn(
                        controlShell,
                        sortOptionBase,
                        'min-h-12 px-3 py-3 active:bg-(--code-bg)/60 sm:min-h-11 sm:px-3 sm:py-2 sm:active:bg-(--code-bg)/50',
                        sort === o.value ? controlActive : controlIdle,
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
