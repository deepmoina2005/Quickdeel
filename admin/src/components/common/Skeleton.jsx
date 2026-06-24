export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="overflow-hidden rounded-md border bg-white dark:bg-slate-900">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid grid-cols-5 gap-4 border-b p-4 last:border-0">
          {Array.from({ length: 5 }).map((__, cell) => (
            <div key={cell} className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return <div className="h-28 animate-pulse rounded-md border bg-slate-100 dark:bg-slate-900" />;
}
