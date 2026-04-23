import { useEffect, useId, useRef, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import { cn } from '@/lib/utils';
import { setDisplayRirPreference, useDisplayRirPreference } from '@/lib/displayRirPreference';

const DISPLAY_RIR_HELP =
  'When on, the log session form shows RIR targets and inputs. Off by default.';

function DisplayRirToggle() {
  const on = useDisplayRirPreference();
  const [helpOpen, setHelpOpen] = useState(false);
  const helpId = useId();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!helpOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setHelpOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHelpOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [helpOpen]);

  return (
    <div
      ref={cardRef}
      className="flex flex-col overflow-hidden rounded-xl border border-(--border) bg-(--bg)"
    >
      <div className="flex items-center justify-between gap-4 px-3.5 py-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <p className="text-sm font-medium text-(--text-h)">Display RIR</p>
          <button
            type="button"
            className="flex size-6 shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--code-bg)/40 text-[11px] font-bold leading-none text-(--text) transition-colors hover:bg-(--code-bg)/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
            aria-expanded={helpOpen}
            aria-controls={helpId}
            aria-label="What is Display RIR?"
            onClick={() => setHelpOpen((v) => !v)}
          >
            ?
          </button>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          className={cn(
            'relative h-7 w-12 shrink-0 rounded-full border border-(--border) transition-colors',
            on ? 'bg-emerald-600/90' : 'bg-(--code-bg)/80',
          )}
          onClick={() => setDisplayRirPreference(!on)}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 size-6 rounded-full bg-(--bg) shadow-(--shadow) transition-transform duration-200',
              on && 'translate-x-5',
            )}
            aria-hidden
          />
        </button>
      </div>
      {helpOpen ? (
        <p
          id={helpId}
          role="region"
          className="wrap-break-word border-t border-(--border) px-3.5 pt-2.5 pb-3.5 text-xs leading-relaxed text-(--text)"
        >
          {DISPLAY_RIR_HELP}
        </p>
      ) : null}
    </div>
  );
}

function PlaceholderFeatureRow() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-(--border) bg-(--bg) px-3.5 py-3.5">
      <p className="min-w-0 text-sm font-medium text-(--text-h)">Placeholder</p>
      <span
        className="shrink-0 rounded-full border border-(--border) bg-(--code-bg)/30 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-(--text)"
        title="Not wired up yet"
      >
        Soon
      </span>
    </div>
  );
}

export function AdvancedFeaturesPage() {
  return (
    <>
      <SubpageHeader fallbackTo="/account" title="Advanced features" backLabel="Back to account" />
      <PageContainer>
        <div className="flex flex-col gap-3">
          <DisplayRirToggle />
          <PlaceholderFeatureRow />
        </div>
      </PageContainer>
    </>
  );
}
