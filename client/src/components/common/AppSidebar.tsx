import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { navRoutes } from '@/lib/navigation';
import logoSvg from '/file.svg';

export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <img src={logoSvg} alt="Logo" className="size-10 rounded-lg" />
          <div className="flex flex-col">
            <span className="text-lg font-bold">DeezNutzApp</span>
            <span className="text-xs text-muted-foreground"></span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navRoutes.map((route) => {
                const Icon = route.icon;
                const isActive = pathname === route.href;
                return (
                  <SidebarMenuItem key={route.href}>
                    <SidebarMenuButton asChild isActive={isActive} className="h-11 text-base">
                      <Link to={route.href}>
                        <Icon className="size-5!" />
                        <span>{route.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
