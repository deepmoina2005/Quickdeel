import { Menu, Moon, Search, Sun, UserCircle } from "lucide-react";
import Button from "../common/Button";
import { useAuth } from "../../context/AuthContext";

export default function TopNavbar({
  onMenuClick,
  breadcrumbs,
  darkMode,
  onToggleDarkMode,
}) {
  const { admin } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/95 px-4 backdrop-blur dark:bg-slate-950/95 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          className="admin-navbar-icon-button h-12 w-12 rounded-md border border-slate-200 bg-white px-0 text-slate-800 shadow-sm hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-brand-500/15 dark:hover:text-brand-100 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu />
        </Button>
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase text-slate-400">
            Admin
          </div>
          <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {breadcrumbs}
          </div>
        </div>
      </div>
      <div className="hidden w-full max-w-md items-center rounded-md border bg-slate-50 px-3 dark:bg-slate-900 md:flex">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          className="h-10 flex-1 bg-transparent px-2 text-sm outline-none"
          placeholder="Search users, listings, reports"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="admin-navbar-icon-button h-12 w-12 rounded-md border border-slate-200 bg-white px-0 text-slate-800 shadow-sm hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-brand-500/15 dark:hover:text-brand-100"
          onClick={onToggleDarkMode}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun /> : <Moon />}
        </Button>
        <div className="hidden items-center gap-3 sm:flex">
          <div className="text-right">
            <p className="text-sm font-semibold">{admin?.name || "Admin"}</p>
            <p className="text-xs text-slate-500">{admin?.role || "admin"}</p>
          </div>
          <div className="admin-navbar-profile-icon grid h-12 w-12 place-items-center rounded-md border border-brand-200 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-500/50 dark:bg-brand-500/20 dark:text-brand-100">
            <UserCircle />
          </div>
        </div>
      </div>
    </header>
  );
}
