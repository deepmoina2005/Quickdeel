import { forwardRef } from "react";
import { cn } from "../../utils/cn";

const Select = forwardRef(({ label, error, children, className, ...props }, ref) => (
  <label className="block space-y-2">
    {label ? <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span> : null}
    <select
      ref={ref}
      className={cn(
        "h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
        error && "border-red-400",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
  </label>
));

Select.displayName = "Select";
export default Select;
