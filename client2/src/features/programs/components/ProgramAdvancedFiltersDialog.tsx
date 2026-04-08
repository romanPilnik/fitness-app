import { forwardRef } from 'react';
import {
  DIFFICULTY_VALUES,
  GOAL_VALUES,
  PROGRAM_SOURCE_VALUES,
  PROGRAM_STATUS_VALUES,
  SPLIT_TYPE_VALUES,
} from '@/lib/apiFilterOptions';
import { formatEnumLabel } from '@/lib/formatEnumLabel';
import { FILTER_SELECT_CLASS } from '@/lib/nativeSelect';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Props = {
  activeOnly: boolean;
  advStatus: string;
  onAdvStatusChange: (v: string) => void;
  difficulty: string;
  onDifficultyChange: (v: string) => void;
  goal: string;
  onGoalChange: (v: string) => void;
  splitType: string;
  onSplitTypeChange: (v: string) => void;
  createdFrom: string;
  onCreatedFromChange: (v: string) => void;
};

const selectClass = cn(FILTER_SELECT_CLASS, 'font-mono-ui');

export const ProgramAdvancedFiltersDialog = forwardRef<HTMLDialogElement, Props>(
  function ProgramAdvancedFiltersDialog(
    {
      activeOnly,
      advStatus,
      onAdvStatusChange,
      difficulty,
      onDifficultyChange,
      goal,
      onGoalChange,
      splitType,
      onSplitTypeChange,
      createdFrom,
      onCreatedFromChange,
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
          <p className="mt-0.5 text-xs text-(--text)">
            Refine by metadata. Turn off &quot;Active only&quot; on the list to filter status here.
          </p>
        </div>
        <div className="flex max-h-[min(70vh,520px)] flex-col gap-3 overflow-y-auto p-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-(--text)">Status</span>
            <select
              className={cn(selectClass, activeOnly && 'cursor-not-allowed opacity-60')}
              value={advStatus}
              disabled={activeOnly}
              onChange={(e) => onAdvStatusChange(e.target.value)}
            >
              <option value="">All</option>
              {PROGRAM_STATUS_VALUES.map((v) => (
                <option key={v} value={v}>
                  {formatEnumLabel(v)}
                </option>
              ))}
            </select>
          </label>
          {activeOnly ? (
            <p className="text-xs text-(--text)">
              Status is fixed to active while &quot;Active only&quot; is on.
            </p>
          ) : null}
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
            <span className="text-(--text)">Created from</span>
            <select
              className={selectClass}
              value={createdFrom}
              onChange={(e) => onCreatedFromChange(e.target.value)}
            >
              <option value="">All</option>
              {PROGRAM_SOURCE_VALUES.map((v) => (
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
    );
  },
);
