import { Outlet, useLocation } from 'react-router-dom';
import { LiveSessionChromeProvider, useLiveSessionChrome } from '@/features/sessions/liveSessionChromeContext';
import { LiveSessionHeader } from '@/features/sessions/components/LiveSessionHeader';
import { BottomNav } from './BottomNav';
import { MainNav } from './MainNav';

function AppShellLayoutInner() {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const isLiveSession =
    location.pathname === '/sessions/new' &&
    Boolean(search.get('programId') && search.get('programWorkoutId'));

  const { chrome } = useLiveSessionChrome();

  return (
    <div className="flex min-h-dvh flex-col bg-(--bg)">
      {isLiveSession && chrome ? (
        <LiveSessionHeader chrome={chrome} />
      ) : (
        <MainNav />
      )}
      <main className="flex-1 pb-[max(6rem,calc(env(safe-area-inset-bottom,0px)+5.25rem))] md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

export function AppShellLayout() {
  return (
    <LiveSessionChromeProvider>
      <AppShellLayoutInner />
    </LiveSessionChromeProvider>
  );
}
