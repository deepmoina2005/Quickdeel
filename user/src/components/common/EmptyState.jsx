import { PackageSearch } from "lucide-react";

const EmptyState = ({ title = "No results found", description = "Try changing filters or search terms." }) => (
  <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
    <PackageSearch className="h-12 w-12 text-slate-400" />
    <h3 className="mt-4 text-lg font-bold">{title}</h3>
    <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
  </div>
);

export default EmptyState;
