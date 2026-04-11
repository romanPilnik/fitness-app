import { forwardRef } from 'react';
import {
  DIFFICULTY_VALUES,
  GOAL_VALUES,
  SPLIT_TYPE_VALUES,
} from '@/lib/apiFilterOptions';
import { formatEnumLabel } from '@/lib/formatEnumLabel';
import { FILTER_SELECT_CLASS } from '@/lib/nativeSelect';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const DAYS_PER_WEEK_OPTIONS = Array.from({ length: 14 }, (_, i) => i + 1);

type Props = {
  difficulty: string;
  onDifficultyChange: (v: string) => void;
  goal: string;
  onGoalChange: (v: string) => void;
  splitType: string;
  onSplitTypeChange: (v: string) => void;
  daysPerWeek: string;
  onDaysPerWeekChange: (v: string) => void;
};

const selectClass = cn(FILTER_SELECT_CLASS, 'font-mono-ui');

export const TemplateAdvancedFiltersDialog = forwardRef<HTMLDialogElement, Props>(
  function TemplateAdvancedFiltersDialog(
    {
      difficulty,
      onDifficultyChange,
      goal,
      onGoalChange,
      splitType,
      onSplitTypeChange,
      daysPerWeek,
      onDaysPerWeekChange,
    },
    ref,
  ) {
    return (
      <dialog
        ref={ref}
        className="w-[calc(100%-2rem)] max-w-md rounded-xl border border-(--border) bg-(--bg) p-0 text-(--text) shadow-lg backdrop:bg-black/40"
      >
        <div className="border-b border-(--border) px-4 py-3">
          <h2 className="text-base font-medium text-(--text-h)">Advanced filters</h2>
          <p className="mt-0.5 text-xs text-(--text)">Refine templates by metadata.</p>
        </div>
        <div className="flex max-h-[min(70vh,520px)] flex-col gap-3 overflow-y-auto p-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-(--text)">Difficulty</span>
            <select
              className={selectClass}
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
            >
              <option value="">All</option>
              {DIFFICULTY_VALUES.map((v) => (
                <option key={v} value={v}>
                  {formatEnumLabel(v)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-(--text)">Goal</span>
            <select className={selectClass} value={goal} onChange={(e) => onGoalChange(e.target.value)}>
              <option value="">All</option>
              {GOAL_VALUES.map((v) => (
                <option key={v} value={v}>
                  {formatEnumLabel(v)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-(--text)">Split</span>
            <select
              className={selectClass}
              value={splitType}
              onChange={(e) => onSplitTypeChange(e.target.value)}
            >
              <option value="">All</option>
              {SPLIT_TYPE_VALUES.map((v) => (
                <option key={v} value={v}>
                  {formatEnumLabel(v)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-(--text)">Days per week</span>
            <select
              className={selectClass}
              value={daysPerWeek}
              onChange={(e) => onDaysPerWeekChange(e.target.value)}
            >
              <option value="">All</option>
              {DAYS_PER_WEEK_OPTIONS.map((n) => (
                <option key={n} value={String(n)}>
                  {n}
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
    );
  },
);
