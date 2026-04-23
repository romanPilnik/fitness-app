import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { ConfirmProvider } from '@/components/ConfirmProvider';
import { BetterAuthProvider } from '@/features/auth/BetterAuthProvider';
import { LiveSessionProvider } from '@/features/sessions/LiveSessionProvider';

function RouteFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-(--bg) px-4">
      <p className="text-sm text-(--text)">Loading…</p>
    </div>
  );
}

/** Root shell: error boundary, auth, live session, confirm, suspense. Requires `RouterProvider`. */
export function RootLayout() {
  return (
    <AppErrorBoundary>
      <BetterAuthProvider>
        <LiveSessionProvider>
          <ConfirmProvider>
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </ConfirmProvider>
        </LiveSessionProvider>
      </BetterAuthProvider>
    </AppErrorBoundary>
  );
}
