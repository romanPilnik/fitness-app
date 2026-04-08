import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ApiError } from '@/api/errors';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/useAuth';
import {
  API_VALIDATION_ERROR_CODE,
  applyApiValidationErrors,
} from '@/lib/applyApiValidationErrors';
import { errorMessageFromUnknown } from '@/lib/utils';
import { fetchCurrentUser, patchCurrentUser, userQueryKeys } from '../api';
import { accountProfileSchema, type AccountProfileForm } from '../schemas';

const accountProfileResolver = zodResolver(accountProfileSchema);

function unitsLabel(units: string) {
  return units === 'metric' ? 'Metric' : 'Imperial';
}

function weekStartLabel(day: string) {
  if (day === 'sunday') return 'Sunday';
  if (day === 'monday') return 'Monday';
  if (day === 'saturday') return 'Saturday';
  return day;
}

export function AccountPage() {
  const { setAuthUser } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const q = useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: fetchCurrentUser,
    staleTime: 60_000,
  });

  const profileValues = useMemo((): AccountProfileForm | undefined => {
    if (!q.data) return undefined;
    return {
      name: q.data.name,
      units: q.data.units,
      weekStartsOn: q.data.weekStartsOn,
    };
  }, [q.data]);

  const form = useForm<AccountProfileForm>({
    resolver: accountProfileResolver,
    values: profileValues,
  });

  const mutation = useMutation({
    mutationFn: patchCurrentUser,
    onSuccess: (profile) => {
      qc.invalidateQueries({ queryKey: userQueryKeys.me() });
      setAuthUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
      });
    },
  });

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
      <Link
        to="/home"
        className="text-sm font-medium text-(--accent) underline-offset-2 hover:underline"
      >
        ← Home
      </Link>
      <header className="border-b border-(--border) pb-4">
        <h1 className="text-2xl font-medium text-(--text-h)">Account</h1>
        {q.data?.role === 'admin' ? (
          <p className="mt-2 text-sm text-(--text)">
            <Link
              to="/admin/exercises"
              className="font-medium text-(--accent) underline-offset-2 hover:underline"
            >
              Exercise library admin
            </Link>
          </p>
        ) : null}
      </header>

      {q.isError ? (
        <QueryErrorMessage error={q.error} refetch={() => q.refetch()} />
      ) : q.isPending ? (
        <p className="text-sm text-(--text)">Loading…</p>
      ) : q.data && !editing ? (
        <div className="flex flex-col gap-4">
          <dl className="flex flex-col gap-3 rounded-xl border border-(--border) p-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-(--text)">Name</dt>
              <dd className="mt-0.5 text-base text-(--text-h)">{q.data.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-(--text)">Units</dt>
              <dd className="mt-0.5 text-base text-(--text-h)">{unitsLabel(q.data.units)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-(--text)">
                Week starts on
              </dt>
              <dd className="mt-0.5 text-base text-(--text-h)">
                {weekStartLabel(q.data.weekStartsOn)}
              </dd>
            </div>
          </dl>
          <Button type="button" onClick={() => setEditing(true)}>
            Edit
          </Button>
        </div>
      ) : q.data ? (
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            const dirty = form.formState.dirtyFields;
            const body: Parameters<typeof patchCurrentUser>[0] = {};
            if (dirty.name) body.name = values.name;
            if (dirty.units) body.units = values.units;
            if (dirty.weekStartsOn) body.weekStartsOn = values.weekStartsOn;
            if (Object.keys(body).length === 0) {
              setEditing(false);
              return;
            }
            try {
              await mutation.mutateAsync(body);
              form.reset(values);
              setEditing(false);
            } catch (e) {
              if (e instanceof ApiError) {
                if (
                  e.code === API_VALIDATION_ERROR_CODE &&
                  applyApiValidationErrors(e, form.setError)
                ) {
                  mutation.reset();
                  return;
                }
                mutation.reset();
                form.setError('root', { type: 'server', message: e.message });
                return;
              }
              mutation.reset();
              form.setError('root', { type: 'server', message: errorMessageFromUnknown(e) });
            }
          })}
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="account-name" className="text-sm font-medium text-(--text-h)">
              Name
            </label>
            <input
              id="account-name"
              className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base text-(--text)"
              {...form.register('name')}
            />
            {form.formState.errors.name?.message ? (
              <p className="text-sm text-red-600" role="alert">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="account-units" className="text-sm font-medium text-(--text-h)">
              Units
            </label>
            <select
              id="account-units"
              className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base text-(--text)"
              {...form.register('units')}
            >
              <option value="metric">Metric</option>
              <option value="imperial">Imperial</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="account-week-start" className="text-sm font-medium text-(--text-h)">
              Week starts on
            </label>
            <select
              id="account-week-start"
              className="min-h-11 rounded-lg border border-(--border) bg-(--bg) px-3 text-base text-(--text)"
              {...form.register('weekStartsOn')}
            >
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
              <option value="saturday">Saturday</option>
            </select>
          </div>

          <p className="text-sm text-(--text)">
            <Link
              to="/account/password"
              className="font-medium text-(--accent) underline-offset-2 hover:underline"
            >
              Change password
            </Link>
          </p>

          {form.formState.errors.root?.message ||
          (mutation.isError ? errorMessageFromUnknown(mutation.error) : null) ? (
            <p className="text-sm text-red-600" role="alert">
              {form.formState.errors.root?.message ??
                (mutation.isError ? errorMessageFromUnknown(mutation.error) : undefined)}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={mutation.isPending || form.formState.isSubmitting}>
              {mutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={mutation.isPending}
              onClick={() => {
                if (q.data) {
                  form.reset({
                    name: q.data.name,
                    units: q.data.units,
                    weekStartsOn: q.data.weekStartsOn,
                  });
                }
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
