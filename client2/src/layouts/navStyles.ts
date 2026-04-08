import { cn } from '@/lib/utils';

export function topNavLinkClassName(isActive: boolean) {
  return cn(
    'inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors',
    'text-(--text) hover:bg-(--code-bg) hover:text-(--text-h)',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)',
    isActive && 'bg-(--accent-bg) text-(--text-h)',
  );
}
