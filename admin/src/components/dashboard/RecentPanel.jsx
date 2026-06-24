export default function RecentPanel({ title, items, render }) {
  return (
    <div className="rounded-md border bg-white p-5 shadow-sm dark:bg-slate-900">
      <h2 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">{title}</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-md border bg-slate-50 p-3 dark:bg-slate-950">
            {render(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
