import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  error: unknown;
  refetch?: () => void;
  resetLabel?: string;
  className?: string;
};

function messageFrom(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong while loading.';
}

export function QueryErrorMessage({
  error,
  refetch,
  resetLabel = 'Try again',
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border border-(--border) bg-(--bg) p-6 text-center',
        className,
      )}
      role="alert"
    >
      <p className="text-sm text-(--text)">{messageFrom(error)}</p>
      {refetch ? (
        <Button type="button" variant="secondary" onClick={refetch}>
          {resetLabel}
        </Button>
      ) : null}
    </div>
  );
}
