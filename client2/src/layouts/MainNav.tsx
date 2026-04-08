import { LogOut } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { useCurrentUser } from '@/features/users/useCurrentUser';
import { cn } from '@/lib/utils';
import { topNavLinkClassName, topNavSignOutClassName } from './navStyles';

export function MainNav() {
  const { isAuthenticated, logout } = useAuth();
  const me = useCurrentUser();

  return (
    <header className="sticky top-0 z-10 border-b border-(--border) bg-(--bg)/95 pt-[env(safe-area-inset-top,0px)] backdrop-blur-xs">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2 sm:px-6 md:py-3">
        <Link
          to={isAuthenticated ? '/home' : '/exercises'}
          className={cn(
            'inline-flex min-h-11 min-w-[44px] items-center rounded-lg text-lg font-semibold uppercase tracking-[0.18em] text-(--text-h)',
            'hover:text-(--accent)',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent-border)',
          )}
        >
          OnlyFitness
        </Link>

        {isAuthenticated && (
          <button
            type="button"
            onClick={() => logout()}
            className={cn(topNavSignOutClassName, 'md:hidden')}
            aria-label="Sign out"
          >
            <LogOut className="size-5 shrink-0" aria-hidden />
          </button>
        )}

        <nav className="hidden flex-wrap items-center gap-1 md:flex" aria-label="Main">
          {isAuthenticated && (
            <NavLink to="/home" end className={({ isActive }) => topNavLinkClassName(isActive)}>
              Home
            </NavLink>
          )}
          <NavLink to="/exercises" className={({ isActive }) => topNavLinkClassName(isActive)}>
            Exercises
          </NavLink>
          <NavLink to="/templates" className={({ isActive }) => topNavLinkClassName(isActive)}>
            Templates
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/programs" className={({ isActive }) => topNavLinkClassName(isActive)}>
              Programs
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/sessions" className={({ isActive }) => topNavLinkClassName(isActive)}>
              Sessions
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/account" className={({ isActive }) => topNavLinkClassName(isActive)}>
              Account
            </NavLink>
          )}
          {isAuthenticated && me.data?.role === 'admin' && (
            <NavLink to="/admin/exercises" className={({ isActive }) => topNavLinkClassName(isActive)}>
              Admin
            </NavLink>
          )}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => logout()}
              className={topNavSignOutClassName}
              aria-label="Sign out"
            >
              <LogOut className="size-5 shrink-0" aria-hidden />
            </button>
          ) : (
            <NavLink to="/login" className={({ isActive }) => topNavLinkClassName(isActive)}>
              Sign in
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
