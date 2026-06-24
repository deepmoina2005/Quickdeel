export default function ChartCard({ title, children }) {
  return (
    <div className="rounded-md border bg-white p-5 shadow-sm dark:bg-slate-900">
      <h2 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">{title}</h2>
      <div className="h-72">{children}</div>
    </div>
  );
}
