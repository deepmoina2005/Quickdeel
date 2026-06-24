import { forwardRef } from 'react';

const Select = forwardRef(function Select({ label, error, options = [], className = '', ...props }, ref) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>}
      <select
        ref={ref}
        className={`focus-ring h-11 w-full rounded-md border bg-white px-3 text-sm text-slate-900 dark:bg-slate-900 dark:text-slate-100 ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
});

export default Select;
