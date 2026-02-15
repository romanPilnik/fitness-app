import {
  LayoutDashboardIcon,
  FolderIcon,
  FileTextIcon,
  DumbbellIcon,
  BarChartIcon,
} from 'lucide-react';

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
