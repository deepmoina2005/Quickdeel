import { X } from 'lucide-react';
import Button from '../common/Button';

export default function Modal({ open, title, children, onClose, size = 'max-w-lg' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className={`w-full ${size} rounded-md border bg-white shadow-soft dark:bg-slate-900`}>
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h2>
          <Button variant="ghost" className="admin-action-button h-11 w-11 px-0" onClick={onClose} aria-label="Close modal">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

