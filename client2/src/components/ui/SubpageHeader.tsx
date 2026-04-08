import { ChevronLeft } from 'lucide-react';
import { useNavigateBack } from '@/hooks/useNavigateBack';
import { cn } from '@/lib/utils';

type SubpageHeaderBaseProps = {
  /** Shown next to the chevron; keep short for truncation. */
  title?: string;
  className?: string;
  /** Optional `location.state` when using `fallbackTo` (ignored when `onBack` is set). */
  fallbackState?: unknown;
  /** If set, called instead of history / fallback navigation (e.g. local wizard step). */
  onBack?: () => void;
};

type SubpageHeaderProps = SubpageHeaderBaseProps &
  (
    | {
        /** Route when there is no SPA history to pop (e.g. cold open). */
        fallbackTo: string;
        /** Accessible name for the back control (e.g. "Back to programs"). */
        backLabel: string;
        /** When false, only the title row is shown (no back control). */
        showBack?: true;
      }
    | {
        showBack: false;
        fallbackTo?: string;
        backLabel?: string;
      }
  );

/**
 * Sticky secondary bar below MainNav: chevron back + optional title.
 * On `md:` the bar is static so it does not stack sticky chrome with the desktop top nav.
 */
export function SubpageHeader({
  fallbackTo,
  fallbackState,
  title,
  backLabel,
  onBack,
  className,
  ...rest
}: SubpageHeaderProps) {
  const showBack = 'showBack' in rest && rest.showBack === false ? false : true;
  const goBack = useNavigateBack(fallbackTo ?? '/', fallbackState);

  return (
    <div
      className={cn(
        'w-full border-b border-(--border) bg-(--bg)/95 backdrop-blur-xs',
        'sticky z-10',
        'top-[calc(env(safe-area-inset-top,0px)+3.75rem)] md:static md:top-auto',
        'md:border-transparent md:bg-transparent md:backdrop-blur-none',
        className,
      )}
    >
      <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-2 md:max-w-3xl md:py-0 md:pb-3">
        {showBack ? (
          <button
            type="button"
            onClick={onBack ?? goBack}
            aria-label={backLabel ?? 'Back'}
            className={cn(
              'inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-(--text-h)',
              'transition-colors hover:bg-(--code-bg)/50 hover:text-(--accent)',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)',
            )}
          >
            <ChevronLeft className="size-6" aria-hidden />
          </button>
        ) : null}
        {title ? (
          <h1 className="min-w-0 flex-1 truncate text-lg font-medium text-(--text-h) md:text-xl">
            {title}
          </h1>
        ) : null}
      </div>
    </div>
  );
}
