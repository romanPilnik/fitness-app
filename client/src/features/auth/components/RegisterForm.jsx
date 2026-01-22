import { useForm, useWatch } from 'react-hook-form';
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
  minLength: { value: 8, message: 'At least 8 characters' },
  pattern: {
    value: /^(?=.*[A-Za-z])(?=.*\d)/,
    message: 'Must contain at least one letter and one number',
  },
};

const NAME_RULES = {
  required: 'Name is required',
  minLength: { value: 2, message: 'At least 2 characters' },
  maxLength: { value: 50, message: 'Maximum 50 characters' },
};

export function RegisterForm({ onSubmit, isLoading = false, serverError = null, className }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    mode: 'onTouched',
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  const password = useWatch({ control, name: 'password' });

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
      className={cn('space-y-4', className)}
      noValidate
    >
      {serverError && (
        <div
          role="alert"
          className="rounded-md border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}
      <FormField
        label="Username"
        type="text"
        placeholder="Username"
        autoComplete="Username"
        required
        error={errors.username?.message}
        disabled={isFormDisabled}
        {...register('username', NAME_RULES)}
      />
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
        autoComplete="new-password"
        required
        error={errors.password?.message}
        disabled={isFormDisabled}
        {...register('password', PASSWORD_RULES)}
      />
      <FormField
        label="Confirm Password"
        type="password"
        placeholder="Confirm password"
        autoComplete="new-password"
        required
        error={errors.confirmPassword?.message}
        disabled={isFormDisabled}
        {...register('confirmPassword', {
          required: 'Please confirm your password',
          validate: (value) => value === password || "Passwords don't match",
        })}
      />
      <Button type="submit" className="w-full" disabled={isFormDisabled}>
        {isFormDisabled ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}
