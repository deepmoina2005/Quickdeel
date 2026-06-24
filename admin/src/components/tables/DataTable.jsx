import { useMemo, useState } from 'react';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';

export default function DataTable({ columns, data, pageSize = 5 }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const visibleData = useMemo(() => data.slice((page - 1) * pageSize, page * pageSize), [data, page, pageSize]);
  const rowKey = (row, index) => row.id ?? row._id ?? row.key ?? `${row.name || row.title || 'row'}-${page}-${index}`;

  if (!data.length) return <EmptyState />;

  return (
    <div className="overflow-hidden rounded-md border bg-white shadow-sm dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-4 py-3 font-semibold">{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleData.map((row, index) => (
              <tr key={rowKey(row, index)} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                {columns.map((column) => (
                  <td key={column.key} className="whitespace-nowrap px-4 py-3 align-middle text-slate-700 dark:text-slate-200">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={Math.min(page, totalPages)} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
