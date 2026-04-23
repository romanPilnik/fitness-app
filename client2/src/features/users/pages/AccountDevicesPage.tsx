import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MonitorSmartphone } from 'lucide-react';
import { SubpageHeader } from '@/components/ui/SubpageHeader';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

export function AccountDevicesPage() {
  const queryClient = useQueryClient();

  const sessionsQ = useQuery({
    queryKey: ['auth', 'list-sessions'],
    queryFn: async () => {
      const res = await authClient.listSessions();
      if (res.error) {
        throw new Error(res.error.message ?? 'Could not load sessions');
      }
      return res.data ?? [];
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await authClient.revokeSession({ token });
      if (res.error) throw new Error(res.error.message ?? 'Could not revoke session');
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['auth', 'list-sessions'] });
    },
  });

  return (
    <>
      <SubpageHeader fallbackTo="/account" title="Devices & sessions" backLabel="Back to account" />
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-8">
        <p className="text-sm text-(--text)">
          Active sign-ins for your account. Revoke a session to sign out that device.
        </p>
        {sessionsQ.isLoading ? (
          <p className="text-sm text-(--text)">Loading…</p>
        ) : sessionsQ.isError ? (
          <p className="text-sm text-red-600" role="alert">
            {sessionsQ.error instanceof Error ? sessionsQ.error.message : 'Failed to load'}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {(sessionsQ.data ?? []).map((s) => (
              <li
                key={s.id}
                className="flex flex-col gap-2 rounded-xl border border-(--border) bg-(--bg) p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--code-bg) text-(--text)">
                    <MonitorSmartphone className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-(--text-h)">
                      {s.userAgent?.trim() ? s.userAgent : 'Session'}
                    </p>
                    <p className="mt-0.5 text-xs text-(--text)">
                      Expires{' '}
                      {s.expiresAt instanceof Date
                        ? s.expiresAt.toLocaleString()
                        : new Date(s.expiresAt).toLocaleString()}
                      {s.ipAddress ? ` · ${s.ipAddress}` : null}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 self-start sm:self-center"
                  disabled={revokeMutation.isPending}
                  onClick={() => revokeMutation.mutate(s.token)}
                >
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        )}
        {(sessionsQ.data?.length ?? 0) === 0 && !sessionsQ.isLoading && !sessionsQ.isError ? (
          <p className="text-sm text-(--text)">No active sessions found.</p>
        ) : null}
      </div>
    </>
  );
}
