import type { ReactNode } from 'react';
import { formatEnumLabel } from '@/lib/formatEnumLabel';
import { cn } from '@/lib/utils';

type Props = {
  goal: string;
  difficulty: string;
  splitType: string;
  className?: string;
};

function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full border border-(--border) bg-(--code-bg)/40 px-3 py-1 text-xs font-medium text-(--text-h)',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function TemplateMetadataChips({ goal, difficulty, splitType, className }: Props) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Chip>{formatEnumLabel(goal)}</Chip>
      <Chip>{formatEnumLabel(difficulty)}</Chip>
      <Chip>{formatEnumLabel(splitType)}</Chip>
    </div>
  );
}
