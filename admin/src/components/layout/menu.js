import {
  Bell,
  Flag,
  FolderTree,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';

export const sidebarItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Users', path: '/users', icon: Users },
  { label: 'Categories', path: '/categories', icon: FolderTree },
  { label: 'Listings', path: '/listings', icon: ListChecks },
  { label: 'Reports', path: '/reports', icon: Flag },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'Logout', path: '/logout', icon: LogOut },
];
