import { NavLink } from 'react-router-dom';
import { Store } from 'lucide-react';
import { sidebarItems } from './menu';

export default function Sidebar({ onLogout, onNavigate }) {
  return (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-800 dark:bg-ink dark:text-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5 dark:border-white/10">
        <div className="grid h-11 w-11 place-items-center rounded-md bg-brand-500 text-white shadow-sm">
          <Store className="h-6 w-6 stroke-[2.4]" />
        </div>
        <div>
          <p className="text-base font-bold text-slate-950 dark:text-white">QuickDeal</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          if (item.label === 'Logout') {
            return (
              <button
                key={item.label}
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <Icon className="h-5 w-5 stroke-[2.2]" />
                {item.label}
              </button>
            );
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5 stroke-[2.2]" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
