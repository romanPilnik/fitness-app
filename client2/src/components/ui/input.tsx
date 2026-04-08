import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'box-border w-full min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 py-2 text-(--text-h) placeholder:text-(--text) focus-visible:border-(--accent-border) focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--accent)/25',
        className,
      )}
      {...props}
    />
  );
});
