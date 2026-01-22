import { cn } from '@/lib/utils';

// FormField - Reusable form field wrapper with label, input, and error display

function FormField({
  ref,
  label,
  error,
  hint,
  className,
  id,
  required,
  type = 'text',
  name,
  ...inputProps
}) {
  const inputId = id || name;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={[error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined}
        className={cn(
          // Base styles
          'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          // Focus styles
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          // Disabled styles
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Error vs normal border
          error ? 'border-destructive focus-visible:ring-destructive' : 'border-input',
        )}
        {...inputProps}
      />

      {/* Hint text - shows below input when no error */}
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}

      {/* Error message - replaces hint when present */}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export { FormField };
