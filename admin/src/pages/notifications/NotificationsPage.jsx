import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import { TableSkeleton } from '../../components/common/Skeleton';
import StatusBadge from '../../components/common/StatusBadge';
import NotificationForm from '../../components/forms/NotificationForm';
import ConfirmModal from '../../components/modals/ConfirmModal';
import Modal from '../../components/modals/Modal';
import DataTable from '../../components/tables/DataTable';
import { useAdminData } from '../../hooks/useAdminData';
import { adminService } from '../../services/admin.service';

export default function NotificationsPage() {
  const loader = useCallback(() => adminService.getNotifications(), []);
  const { data, setData, loading } = useAdminData(loader, []);
  const [sendOpen, setSendOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const sendNotification = (values) => {
    setData((items) => [{ id: Date.now(), ...values, status: 'Sent', createdAt: new Date().toISOString().slice(0, 10) }, ...items]);
    setSendOpen(false);
    toast.success('Notification sent');
  };
  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'audience', header: 'Audience' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', header: 'Created Date' },
    { key: 'actions', header: 'Actions', render: (row) => <Button variant="ghost" className="admin-action-button h-11 w-11 px-0 text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200" onClick={() => setConfirm(row)}><Trash2 className="h-4 w-4" /></Button> },
  ];
  return (
    <>
      <PageHeader title="Notifications" description="Send and manage marketplace announcements." actions={<Button onClick={() => setSendOpen(true)}><Plus className="h-4 w-4" /> Send Notification</Button>} />
      {loading ? <TableSkeleton /> : <DataTable columns={columns} data={data} />}
      <Modal open={sendOpen} title="Send Notification" onClose={() => setSendOpen(false)}>
        <NotificationForm onSubmit={sendNotification} />
      </Modal>
      <ConfirmModal open={Boolean(confirm)} danger title="Delete Notification" message={`Delete ${confirm?.title}?`} onCancel={() => setConfirm(null)} onConfirm={() => { setData((items) => items.filter((item) => item.id !== confirm.id)); setConfirm(null); toast.success('Notification deleted'); }} confirmLabel="Delete" />
    </>
  );
}


