import { useForm } from 'react-hook-form';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const EMAIL_RULES = {
  required: 'Email is required',
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Enter a valid email address',
  },
};

const PASSWORD_RULES = {
  required: 'Password is required',
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

  async function handleFormSubmit(data) {
    try {
      await onSubmit(data);
    } catch (error) {
      if (error.field) {
        setError(error.field, {
          type: 'server',
          message: error.message,
        });
      }
      throw error;
    }
  }

  const isFormDisabled = isLoading || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn('space-y-6', className)}
      noValidate
    >
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
