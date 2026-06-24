import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 border-brand-600",
  secondary: "bg-white text-slate-800 hover:bg-slate-100 border-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 border-transparent dark:text-slate-200 dark:hover:bg-slate-800",
  danger: "bg-red-600 text-white hover:bg-red-700 border-red-600",
};

const Button = ({ children, className, variant = "primary", loading, disabled, icon: Icon, ...props }) => (
  <button
    className={cn(
      "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
      variants[variant],
      className,
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : Icon ? <Icon className="h-5 w-5" /> : null}
    {children}
  </button>
);

export default Button;
