import {
  LayoutDashboardIcon,
  FolderIcon,
  FileTextIcon,
  DumbbellIcon,
  BarChartIcon,
} from 'lucide-react';

/**
 * Navigation routes used by sidebar and bottom nav
 * Add new routes here to have them appear in navigation
 */
export const navRoutes = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    name: 'Programs',
    href: '/programs',
    icon: FolderIcon,
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: FileTextIcon,
  },
  {
    name: 'Exercises',
    href: '/exercises',
    icon: DumbbellIcon,
  },
  {
    name: 'Stats',
    href: '/stats',
    icon: BarChartIcon,
  },
];
