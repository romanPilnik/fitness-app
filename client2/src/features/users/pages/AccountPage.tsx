import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronRight,
  Clock,
  KeyRound,
  LogOut,
  MonitorSmartphone,
  Shield,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { type ComponentType, type ReactNode, useCallback, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ApiError } from '@/api/errors';
import { QueryErrorMessage } from '@/components/QueryErrorMessage';
import { PageContainer } from '@/components/layout/PageContainer';
import { useConfirm } from '@/components/ConfirmProvider';
import { Button } from '@/components/ui/button';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import { useAuth } from '@/features/auth/useAuth';
import { authClient } from '@/lib/auth-client';
import {
  API_VALIDATION_ERROR_CODE,
  applyApiValidationErrors,
} from '@/lib/applyApiValidationErrors';
import { cn, errorMessageFromUnknown } from '@/lib/utils';
import { fetchCurrentUser, patchCurrentUser, userQueryKeys } from '../api';
import { accountProfileSchema, type AccountProfileForm } from '../schemas';

const accountProfileResolver = zodResolver(accountProfileSchema);

type SegmentedOption<T extends string> = { value: T; label: string };

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (next: T) => void;
  options: SegmentedOption<T>[];
  ariaLabel: string;
}) {
  const n = options.length;
  const found = options.findIndex((o) => o.value === value);
  const safeIdx = found >= 0 ? found : 0;

  return (
    <div
      className="relative flex gap-1 rounded-xl border border-(--border) bg-(--code-bg)/35 p-1"
      role="group"
      aria-label={ariaLabel}
    >
      <div
        className="pointer-events-none absolute inset-y-1 rounded-lg bg-(--bg) shadow-(--shadow) transition-[left] duration-200 ease-out motion-reduce:transition-none"
        style={{
          width: `calc((100% - 0.5rem - ${n - 1} * 0.25rem) / ${n})`,
          left: `calc(0.25rem + ${safeIdx} * ((100% - 0.5rem - ${n - 1} * 0.25rem) / ${n} + 0.25rem))`,
        }}
        aria-hidden
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={cn(
            'relative z-10 min-h-11 flex-1 rounded-lg px-2 text-sm font-semibold transition-colors duration-200',
            value === opt.value ? 'text-(--text-h)' : 'text-(--text) hover:text-(--text-h)',
          )}
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function PlaceholderFeatureRow({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-(--border) bg-(--code-bg)/25 px-3 py-3.5 opacity-80">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--code-bg) text-(--text)">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-(--text-h)">{title}</p>
        <p className="mt-0.5 text-xs leading-snug text-(--text)">{description}</p>
      </div>
      <span className="shrink-0 rounded-full border border-(--border) bg-(--bg) px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-(--text)">
        Soon
      </span>
    </div>
  );
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function SettingsSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex min-h-12 items-center justify-between gap-3 px-1">
        <h2 className="text-xs font-semibold uppercase leading-none tracking-wide text-(--text)">
          {title}
        </h2>
        {action ? <div className="flex shrink-0 items-center">{action}</div> : null}
      </div>
      {children ? (
        <div className="overflow-hidden rounded-xl border border-(--border) bg-(--bg)">{children}</div>
      ) : null}
    </section>
  );
}

function SettingsLinkRow({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex min-h-12 items-center gap-3 px-4 py-2.5 text-(--text-h)',
        'transition-colors active:bg-(--code-bg)/60',
        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--accent-border)',
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-(--accent-bg) text-(--text-h)">
        <Icon className="size-4.5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-base font-medium leading-snug">{label}</span>
      <ChevronRight className="size-5 shrink-0 text-(--text)" aria-hidden />
    </Link>
  );
}

export function AccountPage() {
  const confirm = useConfirm();
  const { setAuthUser, logout, user: authUser } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const sendVerifyEmail = useMutation({
    mutationFn: async () => {
      if (!authUser?.email) return;
      const { error } = await authClient.sendVerificationEmail({
        email: authUser.email,
        callbackURL: `${window.location.origin}/account`,
      });
      if (error) throw new Error(error.message ?? 'Could not send email');
    },
  });

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

  const unitsLive = useWatch({ control: form.control, name: 'units' });
  const weekStartsOnLive = useWatch({ control: form.control, name: 'weekStartsOn' });

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

  const exitEditMode = useCallback(() => {
    if (!q.data) return;
    form.reset({
      name: q.data.name,
      units: q.data.units,
      weekStartsOn: q.data.weekStartsOn,
    });
    setEditing(false);
  }, [form, q.data]);

  const persistProfile = useCallback(
    async (values: AccountProfileForm) => {
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
    },
    [form, mutation],
  );

  const onEditProfileBack = useCallback(() => {
    if (!form.formState.isDirty) {
      exitEditMode();
      return;
    }
    void confirm('You have unsaved changes.', {
      cancelLabel: 'Keep editing',
      confirmLabel: 'Discard',
      extraLabel: 'Save changes',
    }).then((result) => {
      if (result === false) return;
      if (result === true) {
        exitEditMode();
        return;
      }
      void form.handleSubmit(persistProfile)();
    });
  }, [confirm, exitEditMode, form, persistProfile]);

  return (
    <>
      {q.data && editing ? (
        <SubpageHeader
          title="Edit profile"
          fallbackTo="/account"
          backLabel="Back to account"
          onBack={onEditProfileBack}
        />
      ) : null}
      <PageContainer className="gap-8 pb-10">
        {!editing ? <h1 className="sr-only">Account</h1> : null}
        {q.isError ? (
          <QueryErrorMessage error={q.error} refetch={() => q.refetch()} />
        ) : q.isPending ? (
          <p className="text-sm text-(--text)">Loading…</p>
        ) : q.data && !editing ? (
          <>
            <div className="flex flex-col items-center gap-3 pt-1 text-center">
              <div
                className="flex size-18 shrink-0 items-center justify-center rounded-full bg-(--code-bg) text-xl font-semibold tracking-tight text-(--text-h)"
                aria-hidden
              >
                {initialsFromName(q.data.name)}
              </div>
              <div className="min-w-0 max-w-full">
                <p className="truncate text-xl font-medium text-(--text-h)">{q.data.name}</p>
                <p className="mt-1 truncate text-sm text-(--text)">{q.data.email}</p>
              </div>
            </div>

            {authUser?.emailVerified === false ? (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-(--text)">
                <p className="font-medium text-(--text-h)">Verify your email</p>
                <p className="mt-1 text-xs">Confirm your address to help secure your account.</p>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-3 w-full"
                  disabled={sendVerifyEmail.isPending}
                  onClick={() => void sendVerifyEmail.mutate()}
                >
                  {sendVerifyEmail.isPending ? 'Sending…' : 'Resend verification email'}
                </Button>
                {sendVerifyEmail.isError ? (
                  <p className="mt-2 text-xs text-red-600" role="alert">
                    {sendVerifyEmail.error instanceof Error
                      ? sendVerifyEmail.error.message
                      : 'Failed to send'}
                  </p>
                ) : null}
                {sendVerifyEmail.isSuccess ? (
                  <p className="mt-2 text-xs text-(--text)">Check your inbox for the link.</p>
                ) : null}
              </div>
            ) : null}

            <SettingsSection
              title="Profile"
              action={
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 min-h-10 shrink-0 rounded-md px-3 py-0 text-xs font-semibold uppercase tracking-wide leading-none"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              }
            />

            <nav className="flex flex-col gap-2" aria-label="Advanced features">
              <h2 className="px-1 text-xs font-semibold uppercase leading-none tracking-wide text-(--text)">
                Advanced features
              </h2>
              <div className="overflow-hidden rounded-xl border border-(--border) bg-(--bg)">
                <div className="divide-y divide-(--border)">
                  <SettingsLinkRow
                    to="/account/ai-preferences"
                    label="Generation settings"
                    icon={Sparkles}
                  />
                  <SettingsLinkRow
                    to="/account/advanced"
                    label="Advanced features"
                    icon={SlidersHorizontal}
                  />
                  <SettingsLinkRow
                    to="/account/devices"
                    label="Devices & sessions"
                    icon={MonitorSmartphone}
                  />
                  <SettingsLinkRow to="/account/password" label="Change password" icon={KeyRound} />
                  {q.data.role === 'admin' ? (
                    <SettingsLinkRow to="/admin/exercises" label="Exercise library admin" icon={Shield} />
                  ) : null}
                </div>
              </div>
            </nav>

            <div className="pt-2">
              <Button
                type="button"
                variant="secondary"
                className="flex w-full items-center justify-center gap-2"
                onClick={() => {
                  void confirm('Sign out?', { confirmLabel: 'Sign out', cancelLabel: 'Cancel' }).then(
                    (ok) => {
                      if (ok === true) void logout();
                    },
                  );
                }}
              >
                <LogOut className="size-4 shrink-0" aria-hidden />
                Sign out
              </Button>
            </div>
          </>
        ) : q.data ? (
          <form className="flex flex-col gap-8" onSubmit={form.handleSubmit(persistProfile)}>
            <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--bg) shadow-(--shadow)">
              <div className="flex flex-col gap-8 p-5">
                <fieldset className="min-w-0 space-y-4 border-0 p-0">
                  <legend className="mb-0 w-full text-xs font-semibold uppercase tracking-wide text-(--text)">
                    Profile
                  </legend>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="account-name" className="text-sm font-medium text-(--text-h)">
                      Name
                    </label>
                    <input
                      id="account-name"
                      autoComplete="name"
                      className="min-h-11 w-full rounded-xl border border-(--border) bg-(--bg) px-3.5 text-base text-(--text) transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name?.message ? (
                      <p className="text-sm text-red-600" role="alert">
                        {form.formState.errors.name.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-xl border border-(--border) bg-(--code-bg)/20 px-3.5 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-(--text)">Email</p>
                    <p className="mt-1 truncate text-base font-medium text-(--text-h)">{q.data.email}</p>
                    <p className="mt-1 text-xs text-(--text)">
                      Email sign-in is managed by your account provider.
                    </p>
                  </div>
                </fieldset>

                <div className="h-px w-full bg-(--border)" aria-hidden />

                <fieldset className="min-w-0 space-y-4 border-0 p-0">
                  <legend className="mb-0 w-full text-xs font-semibold uppercase tracking-wide text-(--text)">
                    Calendar & units
                  </legend>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-(--text-h)">Weight units</span>
                    <SegmentedControl
                      ariaLabel="Units"
                      value={unitsLive ?? q.data.units}
                      onChange={(v) => form.setValue('units', v, { shouldDirty: true })}
                      options={[
                        { value: 'metric', label: 'Metric' },
                        { value: 'imperial', label: 'Imperial' },
                      ]}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-(--text-h)">First day of week</span>
                    <SegmentedControl
                      ariaLabel="Week starts on"
                      value={weekStartsOnLive ?? q.data.weekStartsOn}
                      onChange={(v) => form.setValue('weekStartsOn', v, { shouldDirty: true })}
                      options={[
                        { value: 'sunday', label: 'Sun' },
                        { value: 'monday', label: 'Mon' },
                        { value: 'saturday', label: 'Sat' },
                      ]}
                    />
                  </div>
                </fieldset>

                <div className="h-px w-full bg-(--border)" aria-hidden />

                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-(--text)">More</p>
                  <div className="flex flex-col gap-3">
                    <PlaceholderFeatureRow
                      icon={UserRound}
                      title="Profile photo"
                      description="Show a picture on your profile and in shared summaries."
                    />
                    <PlaceholderFeatureRow
                      icon={Clock}
                      title="Time zone"
                      description="Schedule workouts and reminders in your local time."
                    />
                  </div>
                </div>
              </div>
            </div>

            {form.formState.errors.root?.message ||
            (mutation.isError ? errorMessageFromUnknown(mutation.error) : null) ? (
              <p className="text-sm text-red-600" role="alert">
                {form.formState.errors.root?.message ??
                  (mutation.isError ? errorMessageFromUnknown(mutation.error) : undefined)}
              </p>
            ) : null}

            <div className="pt-1">
              <Button
                type="submit"
                className="w-full min-h-12 py-3 text-base font-semibold"
                disabled={mutation.isPending || form.formState.isSubmitting}
              >
                {mutation.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        ) : null}
      </PageContainer>
    </>
  );
}
