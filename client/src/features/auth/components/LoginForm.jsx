import { useForm } from 'react-hook-form';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * LoginForm - Presentational form component
 *
 * ARCHITECTURE DECISIONS:
 *
 * 1. Props-based API (onSubmit, isLoading, serverError)
 *    - Form knows nothing about auth context, API calls, or routing
 *    - Parent component (LoginPage) handles all business logic
 *    - Makes this component testable, reusable, and predictable
 *
 * 2. Inline validation rules (not Zod)
 *    - You decided to skip Zod for now, which is fine
 *    - RHF's built-in validation is powerful enough for most cases
 *    - Rules are co-located with the field they validate
 *
 * 3. Validation mode: 'onTouched'
 *    - Fields validate on blur (first interaction)
 *    - After first blur, they validate on change (immediate feedback)
 *    - Best UX balance - not intrusive while typing, responsive after interaction
 *
 * 4. Server error handling
 *    - serverError prop for global errors (network, 500s)
 *    - setError available for field-specific server errors (passed via onSubmit rejection)
 *
 * REACT 19 COMPATIBILITY NOTE:
 * If you need to watch field values for conditional rendering or cross-field
 * validation (like password confirmation), use useWatch instead of watch().
 * React 19's aggressive batching can cause watch() to not trigger re-renders.
 *
 * Example for RegisterForm:
 *   import { useForm, useWatch } from 'react-hook-form';
 *   const { control } = useForm();
 *   const password = useWatch({ control, name: 'password' });
 */

// Validation rules extracted as constants
// This makes them reusable (RegisterForm will use EMAIL_RULES too)
// and keeps the JSX clean
const EMAIL_RULES = {
  required: 'Email is required',
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Enter a valid email address',
  },
};

const PASSWORD_RULES = {
  required: 'Password is required',
  // Note: On login, we don't validate password format
  // The server will reject invalid credentials
  // Over-validating here leaks information (attacker learns password rules)
};

export function LoginForm({ onSubmit, isLoading = false, serverError = null, className }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Wrapper that handles the async submission and field-specific errors
  // This pattern allows the parent to throw errors that map to specific fields
  async function handleFormSubmit(data) {
    try {
      await onSubmit(data);
    } catch (error) {
      // If parent throws an error with a 'field' property, set it on that field
      // Otherwise it's handled by the serverError prop
      if (error.field) {
        setError(error.field, {
          type: 'server',
          message: error.message,
        });
      }
      // Re-throw so parent can also handle if needed (e.g., logging)
      throw error;
    }
  }

  // Combined loading state - either parent says loading OR form is mid-submission
  // This handles the gap between form submission and parent updating isLoading
  const isFormDisabled = isLoading || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn('space-y-6', className)}
      noValidate // Disable browser validation, RHF handles it
    >
      {/* Global server error - network failures, unexpected errors */}
      {serverError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      <FormField
        label="Email"
        type="email"
        placeholder="Email address"
        autoComplete="email"
        required
        error={errors.email?.message}
        disabled={isFormDisabled}
        {...register('email', EMAIL_RULES)}
      />

      <FormField
        label="Password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        required
        error={errors.password?.message}
        disabled={isFormDisabled}
        {...register('password', PASSWORD_RULES)}
      />

      <Button type="submit" className="w-full" disabled={isFormDisabled}>
        {isFormDisabled ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
