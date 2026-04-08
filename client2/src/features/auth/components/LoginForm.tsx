import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { safeReturnPath } from '@/lib/returnPath';
import { authClient } from '@/lib/auth-client';
import { loginSchema, type LoginFormValues } from '../schemas';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });
      if (error) throw new Error(error.message ?? 'Invalid credentials');
    },
    onSuccess: () => {
      const from = (location.state as { from?: string } | null)?.from;
      navigate(safeReturnPath(from, '/home'), { replace: true });
    },
    onError: (err: unknown) => {
      setError('root', {
        message: err instanceof Error ? err.message : 'Something went wrong. Try again.',
      });
    },
  });

  return (
    <form
      className="flex w-full max-w-md flex-col gap-4"
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      <div className="flex flex-col gap-1.5 text-left">
        <label htmlFor="login-email" className="text-sm font-medium text-(--text-h)">
          Email
        </label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'login-email-err' : undefined}
          {...register('email')}
        />
        {errors.email ? (
          <p id="login-email-err" className="text-sm text-red-500" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5 text-left">
        <label htmlFor="login-password" className="text-sm font-medium text-(--text-h)">
          Password
        </label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'login-password-err' : undefined}
          {...register('password')}
        />
        {errors.password ? (
          <p id="login-password-err" className="text-sm text-red-500" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      {errors.root ? (
        <p className="text-center text-sm text-red-500" role="alert">
          {errors.root.message}
        </p>
      ) : null}

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-(--text)">
        No account?{' '}
        <Link
          to="/register"
          className="font-medium text-(--accent) underline-offset-2 hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
}
