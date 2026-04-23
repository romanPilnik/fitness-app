import { Check, Pause, Play, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LiveSessionChromeApi } from '../liveSessionChromeContext';

type Props = {
  chrome: LiveSessionChromeApi;
};

export function LiveSessionHeader({ chrome }: Props) {
  const variant = chrome.headerVariant ?? 'workout';
  return (
    <header className="sticky top-0 z-10 border-b border-(--border) bg-(--bg)/95 pt-[env(safe-area-inset-top,0px)] backdrop-blur-xs">
      <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-3.5">
        <Button
          type="button"
          variant="secondary"
          className="min-h-11 min-w-11 shrink-0 px-0 py-0 text-red-500 transition-transform duration-150 hover:bg-red-950/35 hover:text-red-400 active:scale-[0.96] active:opacity-90 sm:min-h-12 sm:min-w-12"
          onClick={() => void chrome.onQuit()}
          aria-label={variant === 'reorder' ? 'Back' : 'Quit workout without saving'}
        >
          <X className="mx-auto size-5 sm:size-6" strokeWidth={2.5} aria-hidden />
        </Button>

        <div className="flex min-w-0 flex-1 flex-col items-start justify-center px-1 text-left">
          <p
            className="max-w-full truncate text-base font-semibold text-(--text-h) sm:text-lg"
            title={chrome.workoutTitleLine}
          >
            {chrome.workoutTitleLine}
          </p>
          {variant === 'workout' ? (
            <span
              className="font-mono text-xl leading-tight text-(--text-h) tabular-nums sm:text-2xl"
              style={{ fontFamily: 'var(--mono)' }}
            >
              {chrome.elapsedLabel}
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {variant === 'workout' ? (
            <>
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 min-w-11 px-0 py-0 sm:min-h-12 sm:min-w-12"
                onClick={chrome.onPauseToggle}
                aria-label={chrome.isPaused ? 'Resume timer' : 'Pause timer'}
              >
                {chrome.isPaused ? (
                  <Play className="mx-auto size-5 sm:size-6" aria-hidden />
                ) : (
                  <Pause className="mx-auto size-5 sm:size-6" aria-hidden />
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 min-w-11 px-0 py-0 sm:min-h-12 sm:min-w-12"
                onClick={chrome.onOpenGear}
                aria-label="Session options"
              >
                <Settings className="mx-auto size-5 sm:size-6" aria-hidden />
              </Button>
            </>
          ) : null}
          <Button
            type="button"
            className="min-h-11 min-w-11 px-0 py-0 sm:min-h-12 sm:min-w-12"
            onClick={chrome.onComplete}
            disabled={chrome.completeDisabled}
            aria-label={variant === 'reorder' ? 'Save order' : 'Finish workout'}
          >
            <Check className="mx-auto size-5 sm:size-6" aria-hidden />
          </Button>
        </div>
      </div>
    </header>
  );
}
