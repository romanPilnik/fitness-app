import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { navRoutes } from '@/lib/navigation';

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-sidebar">
      <div className="flex items-center justify-around">
        {navRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              to={route.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span>{route.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
