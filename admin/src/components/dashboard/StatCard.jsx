import { TrendingUp } from 'lucide-react';

export default function StatCard({ label, value, trend, icon: Icon }) {
  return (
    <div className="rounded-md border bg-white p-5 shadow-sm dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-md bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>{trend} this month</span>
      </div>
    </div>
  );
}
