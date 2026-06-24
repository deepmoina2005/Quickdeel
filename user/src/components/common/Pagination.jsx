import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

const Pagination = ({ page, totalPages, onPageChange }) => (
  <div className="flex items-center justify-between rounded-b-xl border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
    <span className="text-sm text-slate-600 dark:text-slate-300">Page {page} of {totalPages}</span>
    <div className="flex gap-2">
      <Button variant="secondary" icon={ChevronLeft} disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page" />
      <Button variant="secondary" icon={ChevronRight} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page" />
    </div>
  </div>
);

export default Pagination;
