import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopNavbar from '../components/layout/TopNavbar';
import { useAuth } from '../context/AuthContext';
import { applyTheme, getPreferredTheme } from '../utils/theme';

const names = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/categories': 'Categories',
  '/listings': 'Listings',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
};

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState(getPreferredTheme);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const breadcrumbs = useMemo(() => `Home / ${names[location.pathname] || 'Dashboard'}`, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        <Sidebar onLogout={handleLogout} />
      </div>
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/60" onClick={() => setDrawerOpen(false)} aria-label="Close menu" />
          <div className="relative h-full w-72">
            <Sidebar onLogout={handleLogout} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
      <div className="lg:pl-72">
        <TopNavbar
          breadcrumbs={breadcrumbs}
          darkMode={theme === 'dark'}
          onMenuClick={() => setDrawerOpen(true)}
          onToggleDarkMode={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
        />
        <main className="px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
