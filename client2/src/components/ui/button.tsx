import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', type = 'button', disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-lg px-4 py-2.5 text-base font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border) disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' && 'bg-(--text-h) text-(--bg) hover:opacity-90',
        variant === 'secondary' &&
          'border border-(--border) bg-transparent text-(--text-h) hover:bg-(--code-bg)',
        className,
      )}
      {...props}
    />
  );
});
