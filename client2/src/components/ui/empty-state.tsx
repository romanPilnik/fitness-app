import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border border-dashed border-(--border) bg-(--code-bg)/30 px-6 py-10 text-center',
        className,
      )}
    >
      <h2 className="text-lg font-medium text-(--text-h)">{title}</h2>
      {description ? <p className="max-w-sm text-sm text-(--text)">{description}</p> : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
