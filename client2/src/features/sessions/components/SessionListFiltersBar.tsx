import { SESSION_STATUS_VALUES } from '@/lib/apiFilterOptions';
import { FILTER_SELECT_CLASS } from '@/lib/nativeSelect';
import { cn } from '@/lib/utils';
import { formatEnumLabel } from '@/lib/formatEnumLabel';
import type { SessionDatePreset } from '../sessionDateRange';

const controlShell =
  'inline-flex min-h-11 w-full min-w-0 shrink-0 items-center justify-center rounded-md border px-2.5 font-mono-ui text-sm leading-none text-(--text-h) transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border) sm:w-auto sm:px-3';

const controlIdle = 'border-(--border) bg-(--bg) hover:bg-(--code-bg)/50';

const DATE_PRESETS: { value: SessionDatePreset; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'last7', label: 'Last 7 days' },
  { value: 'last30', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom range' },
];

type Props = {
  sessionStatus: string;
  onSessionStatusChange: (next: string) => void;
  programId: string;
  onProgramIdChange: (next: string) => void;
  programOptions: { id: string; name: string }[];
  programsLoading: boolean;
  datePreset: SessionDatePreset;
  onDatePresetChange: (next: SessionDatePreset) => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (next: string) => void;
  onCustomToChange: (next: string) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
};

export function SessionListFiltersBar({
  sessionStatus,
  onSessionStatusChange,
  programId,
  onProgramIdChange,
  programOptions,
  programsLoading,
  datePreset,
  onDatePresetChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  onClearFilters,
  activeFilterCount,
}: Props) {
  const selectClass = cn(FILTER_SELECT_CLASS, 'sm:min-w-[11rem]');

  return (
    <section
      aria-label="Session list filters"
      className="w-full min-w-0 rounded-lg border border-(--border) bg-(--code-bg)/25 px-2 py-2 sm:px-3 sm:py-2.5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-3">
        <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-1 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
          <label className="flex min-w-0 flex-col gap-1 sm:min-w-[10rem] sm:max-w-xs">
            <span className="text-xs font-medium text-(--text) sm:text-sm">Status</span>
            <select
              className={selectClass}
              value={sessionStatus}
              onChange={(e) => onSessionStatusChange(e.target.value)}
              aria-label="Filter by session status"
            >
              <option value="">All</option>
              {SESSION_STATUS_VALUES.map((v) => (
                <option key={v} value={v}>
                  {formatEnumLabel(v)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-1 sm:min-w-[12rem] sm:max-w-xs">
            <span className="text-xs font-medium text-(--text) sm:text-sm">Program</span>
            <select
              className={selectClass}
              value={programId}
              onChange={(e) => onProgramIdChange(e.target.value)}
              disabled={programsLoading}
              aria-label="Filter by program"
            >
              <option value="">All programs</option>
              {programOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-1 sm:min-w-[11rem] sm:max-w-xs">
            <span className="text-xs font-medium text-(--text) sm:text-sm">Date</span>
            <select
              className={selectClass}
              value={datePreset}
              onChange={(e) => onDatePresetChange(e.target.value as SessionDatePreset)}
              aria-label="Filter by date range"
            >
              {DATE_PRESETS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={onClearFilters}
            className={cn(
              controlShell,
              'shrink-0 whitespace-nowrap py-2.5 sm:py-2',
              controlIdle,
            )}
          >
            Clear filters
            <span className="ml-1.5 flex min-w-5 items-center justify-center rounded bg-(--text-h) px-1.5 py-0.5 text-xs font-semibold leading-none text-(--bg)">
              {activeFilterCount}
            </span>
          </button>
        ) : null}
      </div>

      {datePreset === 'custom' ? (
        <div className="mt-2 flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
          <label className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-xs">
            <span className="text-xs font-medium text-(--text) sm:text-sm">From</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => onCustomFromChange(e.target.value)}
              className={cn(FILTER_SELECT_CLASS, 'font-mono-ui')}
              aria-label="Custom range start date"
            />
          </label>
          <label className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-xs">
            <span className="text-xs font-medium text-(--text) sm:text-sm">To</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => onCustomToChange(e.target.value)}
              className={cn(FILTER_SELECT_CLASS, 'font-mono-ui')}
              aria-label="Custom range end date"
            />
          </label>
        </div>
      ) : null}
    </section>
  );
}
