import { Search } from 'lucide-react';
import Select from './Select';

export default function SearchFilterBar({ search, onSearch, filter, onFilter, filterOptions = [], placeholder = 'Search...' }) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-md border bg-white p-3 dark:bg-slate-900 sm:flex-row">
      <label className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={placeholder}
          className="focus-ring h-11 w-full rounded-md border bg-white pl-9 pr-3 text-sm dark:bg-slate-950"
        />
      </label>
      {filterOptions.length > 0 && (
        <Select value={filter} onChange={(event) => onFilter(event.target.value)} options={filterOptions} className="sm:w-48" />
      )}
    </div>
  );
}
