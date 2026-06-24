import { forwardRef } from "react";
import { cn } from "../../utils/cn";

const Textarea = forwardRef(({ label, error, className, ...props }, ref) => (
  <label className="block space-y-2">
    {label ? <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span> : null}
    <textarea
      ref={ref}
      className={cn(
        "min-h-32 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
        error && "border-red-400 focus:border-red-500 focus:ring-red-100",
        className,
      )}
      {...props}
    />
    {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
  </label>
));

Textarea.displayName = "Textarea";
export default Textarea;
