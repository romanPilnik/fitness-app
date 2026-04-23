import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { CenteredCardLayout } from '@/layouts/CenteredCardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo,
      });
      if (error) throw new Error(error.message ?? 'Could not send reset email');
    },
  });

  if (mutation.isSuccess) {
    return (
      <CenteredCardLayout title="Check your email">
        <p className="text-center text-sm text-(--text)">
          If an account exists for that address, we sent a link to reset your password.
        </p>
        <Link
          to="/login"
          className="mt-4 block text-center text-sm font-medium text-(--accent) underline-offset-2 hover:underline"
        >
          Back to sign in
        </Link>
      </CenteredCardLayout>
    );
  }

  return (
    <CenteredCardLayout title="Forgot password">
      <form
        className="flex w-full max-w-md flex-col gap-4"
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        noValidate
      >
        <p className="text-sm text-(--text)">
          Enter your email and we&apos;ll send you a reset link if an account exists.
        </p>
        <div className="flex flex-col gap-1.5 text-left">
          <label htmlFor="forgot-email" className="text-sm font-medium text-(--text-h)">
            Email
          </label>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register('email')}
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-red-500" role="alert">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>
        {mutation.isError ? (
          <p className="text-center text-sm text-red-500" role="alert">
            {mutation.error instanceof Error ? mutation.error.message : 'Something went wrong'}
          </p>
        ) : null}
        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? 'Sending…' : 'Send reset link'}
        </Button>
        <p className="text-center text-sm text-(--text)">
          <Link
            to="/login"
            className="font-medium text-(--accent) underline-offset-2 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </CenteredCardLayout>
  );
}
