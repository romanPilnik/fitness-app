import { Activity, BookOpen, Home, Layers, Plus, Shield, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { useLiveSession } from '@/features/sessions/useLiveSession';
import { useCurrentUser } from '@/features/users/useCurrentUser';
import { cn } from '@/lib/utils';

const bottomItemLayout =
  'flex min-h-14 min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 text-xs font-medium leading-snug active:opacity-90';

function bottomItemClass(isActive: boolean) {
  return cn(
    bottomItemLayout,
    'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)',
    isActive ? 'text-(--accent)' : 'text-(--text) hover:text-(--text-h)',
  );
}

function startTabActive(pathname: string) {
  return pathname === '/sessions/start' || pathname === '/sessions/new';
}

export function BottomNav() {
  const { isAuthenticated } = useAuth();
  const me = useCurrentUser();
  const { pathname } = useLocation();
  const { liveSession } = useLiveSession();

  const liveSessionPath =
    liveSession != null
      ? `/sessions/new?programId=${encodeURIComponent(liveSession.programId)}&programWorkoutId=${encodeURIComponent(liveSession.programWorkoutId)}`
      : '/sessions/start';

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-(--border) bg-(--bg)/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xs md:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-3xl flex-wrap items-stretch justify-around px-1 pt-1.5 pb-1">
        <NavLink to="/home" end className={({ isActive }) => bottomItemClass(isActive)}>
          <Home className="size-6 shrink-0" aria-hidden />
          <span>Home</span>
        </NavLink>
        <NavLink to="/programs" className={({ isActive }) => bottomItemClass(isActive)}>
          <Layers className="size-6 shrink-0" aria-hidden />
          <span>Programs</span>
        </NavLink>
        <NavLink
          to={liveSessionPath}
          className={() =>
            liveSession != null
              ? cn(
                  bottomItemLayout,
                  'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)',
                  startTabActive(pathname)
                    ? 'text-emerald-400 hover:text-emerald-300'
                    : 'text-red-500 hover:text-red-400',
                )
              : bottomItemClass(startTabActive(pathname))
          }
          aria-label={liveSession != null ? 'Return to live workout' : 'Start session'}
        >
          {liveSession != null ? (
            <Activity className="size-6 shrink-0" aria-hidden />
          ) : (
            <Plus className="size-6 shrink-0" aria-hidden />
          )}
          <span>{liveSession != null ? 'Live' : 'Start'}</span>
        </NavLink>
        <NavLink to="/library" className={({ isActive }) => bottomItemClass(isActive)}>
          <BookOpen className="size-6 shrink-0" aria-hidden />
          <span>Library</span>
        </NavLink>
        {me.data?.role === 'admin' && (
          <NavLink to="/admin/exercises" className={({ isActive }) => bottomItemClass(isActive)}>
            <Shield className="size-6 shrink-0" aria-hidden />
            <span>Admin</span>
          </NavLink>
        )}
        <NavLink to="/account" className={({ isActive }) => bottomItemClass(isActive)}>
          <User className="size-6 shrink-0" aria-hidden />
          <span>Account</span>
        </NavLink>
      </div>
    </nav>
  );
}
