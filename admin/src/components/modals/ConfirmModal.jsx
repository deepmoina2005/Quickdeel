import Button from '../common/Button';
import Modal from './Modal';

export default function ConfirmModal({ open, title = 'Confirm action', message, onCancel, onConfirm, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
