import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No records found', description = 'Try changing filters or search terms.' }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed bg-white p-8 text-center dark:bg-slate-900">
      <Inbox className="h-10 w-10 text-slate-400" />
      <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}
