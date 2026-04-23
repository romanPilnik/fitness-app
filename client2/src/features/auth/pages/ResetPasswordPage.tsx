import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { CenteredCardLayout } from '@/layouts/CenteredCardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { passwordRegex } from '@/features/users/schemas';

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8)
      .max(128)
      .regex(passwordRegex, 'Password must contain letters and numbers'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!token) throw new Error('Missing reset token');
      const { error } = await authClient.resetPassword({
        newPassword: values.newPassword,
        token,
      });
      if (error) throw new Error(error.message ?? 'Could not reset password');
    },
  });

  if (!token) {
    return (
      <CenteredCardLayout title="Invalid link">
        <p className="text-center text-sm text-(--text)">
          This reset link is missing a token. Request a new link from the forgot password page.
        </p>
        <Link
          to="/forgot-password"
          className="mt-4 block text-center text-sm font-medium text-(--accent) underline-offset-2 hover:underline"
        >
          Forgot password
        </Link>
      </CenteredCardLayout>
    );
  }

  if (mutation.isSuccess) {
    return (
      <CenteredCardLayout title="Password updated">
        <p className="text-center text-sm text-(--text)">You can sign in with your new password.</p>
        <Link
          to="/login"
          className="mt-4 block text-center text-sm font-medium text-(--accent) underline-offset-2 hover:underline"
        >
          Sign in
        </Link>
      </CenteredCardLayout>
    );
  }

  return (
    <CenteredCardLayout title="Set a new password">
      <form
        className="flex w-full max-w-md flex-col gap-4"
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        noValidate
      >
        <div className="flex flex-col gap-1.5 text-left">
          <label htmlFor="reset-new" className="text-sm font-medium text-(--text-h)">
            New password
          </label>
          <Input
            id="reset-new"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(form.formState.errors.newPassword)}
            {...form.register('newPassword')}
          />
          {form.formState.errors.newPassword ? (
            <p className="text-sm text-red-500" role="alert">
              {form.formState.errors.newPassword.message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5 text-left">
          <label htmlFor="reset-confirm" className="text-sm font-medium text-(--text-h)">
            Confirm password
          </label>
          <Input
            id="reset-confirm"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(form.formState.errors.confirmPassword)}
            {...form.register('confirmPassword')}
          />
          {form.formState.errors.confirmPassword ? (
            <p className="text-sm text-red-500" role="alert">
              {form.formState.errors.confirmPassword.message}
            </p>
          ) : null}
        </div>
        {mutation.isError ? (
          <p className="text-center text-sm text-red-500" role="alert">
            {mutation.error instanceof Error ? mutation.error.message : 'Something went wrong'}
          </p>
        ) : null}
        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? 'Saving…' : 'Update password'}
        </Button>
      </form>
    </CenteredCardLayout>
  );
}
