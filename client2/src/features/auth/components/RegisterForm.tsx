import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { safeReturnPath } from '@/lib/returnPath';
import { applyApiValidationErrors } from '@/lib/applyApiValidationErrors';
import { registerRequest } from '../api';
import { registerSchema, type RegisterFormValues } from '../schemas';
import { useAuth } from '../useAuth';

export function RegisterForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', name: '' },
  });

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      login(data.token, data.user);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(safeReturnPath(from, '/home'), { replace: true });
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        if (applyApiValidationErrors(err, setError)) return;
        setError('root', { message: err.message });
        return;
      }
      setError('root', { message: 'Something went wrong. Try again.' });
    },
  });

  return (
    <form
      className="flex w-full max-w-md flex-col gap-4"
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      <div className="flex flex-col gap-1.5 text-left">
        <label htmlFor="register-name" className="text-sm font-medium text-(--text-h)">
          Name
        </label>
        <Input
          id="register-name"
          type="text"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'register-name-err' : undefined}
          {...register('name')}
        />
        {errors.name ? (
          <p id="register-name-err" className="text-sm text-red-500" role="alert">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5 text-left">
        <label htmlFor="register-email" className="text-sm font-medium text-(--text-h)">
          Email
        </label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'register-email-err' : undefined}
          {...register('email')}
        />
        {errors.email ? (
          <p id="register-email-err" className="text-sm text-red-500" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5 text-left">
        <label htmlFor="register-password" className="text-sm font-medium text-(--text-h)">
          Password
        </label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'register-password-err' : undefined}
          {...register('password')}
        />
        {errors.password ? (
          <p id="register-password-err" className="text-sm text-red-500" role="alert">
            {errors.password.message}
          </p>
        ) : null}
        <p className="text-xs text-(--text)">8+ characters, letters and numbers.</p>
      </div>

      {errors.root ? (
        <p className="text-center text-sm text-red-500" role="alert">
          {errors.root.message}
        </p>
      ) : null}

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? 'Creating account…' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-(--text)">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-(--accent) underline-offset-2 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
