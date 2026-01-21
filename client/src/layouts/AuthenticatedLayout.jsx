import { Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthContext';
import { AppSidebar } from '@/components/common/AppSidebar';
import { BottomNav } from '@/components/common/BottomNav';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export default function AuthenticatedLayout() {
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
          <SidebarTrigger className="hidden md:flex" />
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-foreground">Welcome back,</span>
              <span className="text-base text-muted-foreground">{user?.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background pb-20 md:pb-0 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>

      <BottomNav />
    </SidebarProvider>
  );
}
