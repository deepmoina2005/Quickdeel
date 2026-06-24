import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong.' }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
      <AlertTriangle className="h-5 w-5" />
      <span>{message}</span>
    </div>
  );
}
