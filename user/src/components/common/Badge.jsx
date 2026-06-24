import { cn } from "../../utils/cn";

const colors = {
  Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
  Sold: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  Featured: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
};

const Badge = ({ children, className }) => (
  <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold", colors[children] || colors.Active, className)}>
    {children}
  </span>
);

export default Badge;
