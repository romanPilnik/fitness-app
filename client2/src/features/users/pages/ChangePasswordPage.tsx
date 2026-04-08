import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ApiError } from '@/api/errors';
import { Button } from '@/components/ui/button';
import {
  API_VALIDATION_ERROR_CODE,
  applyApiValidationErrors,
} from '@/lib/applyApiValidationErrors';
import { changePassword } from '../api';
import { changePasswordFormSchema, type ChangePasswordForm } from '../schemas';

export function ChangePasswordPage() {
  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (body: { oldPassword: string; newPassword: string }) => changePassword(body),
  });

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <Link
        to="/account"
        className="text-sm font-medium text-(--accent) underline-offset-2 hover:underline"
      >
        ← Account
      </Link>
      <header className="border-b border-(--border) pb-4">
        <h1 className="text-2xl font-medium text-(--text-h)">Change password</h1>
      </header>

      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await mutation.mutateAsync({
              oldPassword: values.oldPassword,
              newPassword: values.newPassword,
            });
            form.reset({
              oldPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
          } catch (e) {
            if (e instanceof ApiError && e.code === API_VALIDATION_ERROR_CODE) {
              applyApiValidationErrors(e, form.setError);
            }
          }
        })}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="pw-old" className="text-sm font-medium text-(--text-h)">
            Current password
          </label>
          <input
            id="pw-old"
            type="password"
            autoComplete="current-password"
            className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base text-(--text)"
            {...form.register('oldPassword')}
          />
          {form.formState.errors.oldPassword?.message ? (
            <p className="text-sm text-red-600" role="alert">
              {form.formState.errors.oldPassword.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="pw-new" className="text-sm font-medium text-(--text-h)">
            New password
          </label>
          <input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base text-(--text)"
            {...form.register('newPassword')}
          />
          {form.formState.errors.newPassword?.message ? (
            <p className="text-sm text-red-600" role="alert">
              {form.formState.errors.newPassword.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="pw-confirm" className="text-sm font-medium text-(--text-h)">
            Confirm new password
          </label>
          <input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base text-(--text)"
            {...form.register('confirmPassword')}
          />
          {form.formState.errors.confirmPassword?.message ? (
            <p className="text-sm text-red-600" role="alert">
              {form.formState.errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        {mutation.isSuccess ? (
          <p className="text-sm text-green-700" role="status">
            Password updated.
          </p>
        ) : null}
        {mutation.isError && mutation.error instanceof ApiError ? (
          <p className="text-sm text-red-600" role="alert">
            {mutation.error.message}
          </p>
        ) : null}

        <Button type="submit" disabled={mutation.isPending || form.formState.isSubmitting}>
          {mutation.isPending ? 'Saving…' : 'Update password'}
        </Button>
      </form>
    </div>
  );
}
