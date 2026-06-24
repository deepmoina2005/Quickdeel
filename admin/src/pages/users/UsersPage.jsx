import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Ban, CheckCircle, Eye, Trash2, UserRound } from 'lucide-react';
import Button from '../../components/common/Button';
import ErrorState from '../../components/common/ErrorState';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import PageHeader from '../../components/common/PageHeader';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import { TableSkeleton } from '../../components/common/Skeleton';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/modals/ConfirmModal';
import Modal from '../../components/modals/Modal';
import DataTable from '../../components/tables/DataTable';
import { useAdminData } from '../../hooks/useAdminData';
import { adminService } from '../../services/admin.service';
import { mediaUrl } from '../../utils/media';

export default function UsersPage() {
  const loader = useCallback(() => adminService.getUsers({ page: 1, limit: 50 }), []);
  const { data, setData, loading, error } = useAdminData(loader, { data: [] });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const records = Array.isArray(data) ? data : data.data || [];

  const updateRecords = (updater) => setData((current) => {
    const currentRows = Array.isArray(current) ? current : current.data || [];
    const nextRows = updater(currentRows);
    return Array.isArray(current) ? nextRows : { ...current, data: nextRows };
  });

  const rows = useMemo(() => records.map((user) => ({
    ...user,
    status: user.status || (user.isVerifiedSeller ? 'Active' : 'Pending'),
    role: user.role || 'USER',
    phone: user.phone || '-',
    createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-',
  })).filter((user) => {
    const matchesSearch = [user.name, user.email, user.phone].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || user.status === filter || user.role === filter;
    return matchesSearch && matchesFilter;
  }), [records, search, filter]);

  const activateUser = async (user) => {
    const updatedUser = await adminService.updateUser(user.id, { isVerifiedSeller: true });
    updateRecords((items) => items.map((item) => item.id === user.id ? { ...item, ...updatedUser, isVerifiedSeller: true } : item));
    toast.success(`${user.name} activated`);
  };

  const suspendUser = () => toast.error('Suspend user API is not available in the backend yet');

  const columns = [
    {
      key: 'avatar',
      header: 'Avatar',
      render: (row) => row.avatar ? (
        <ImageWithFallback src={mediaUrl(row.avatar)} alt={row.name} className="h-11 w-11 rounded-md object-cover" />
      ) : (
        <div className="grid h-12 w-12 place-items-center rounded-md border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/20 dark:text-brand-100">
          <UserRound className="h-7 w-7 stroke-[2.7]" />
        </div>
      ),
    },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', header: 'Created Date' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" className="admin-action-button h-11 w-11 px-0" onClick={() => setSelected(row)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" className="admin-action-button h-11 w-11 px-0" onClick={() => row.status === 'Pending' ? activateUser(row) : suspendUser(row)}>
            {row.status === 'Pending' ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" className="admin-action-button h-11 w-11 px-0 text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200" onClick={() => setConfirm(row)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Users" description="View users, search, filter, inspect details, and run available admin user updates." />
      <SearchFilterBar search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} placeholder="Search users" filterOptions={[
        { label: 'All Users', value: 'All' }, { label: 'Active', value: 'Active' }, { label: 'Pending', value: 'Pending' }, { label: 'Admins', value: 'ADMIN' }, { label: 'Users', value: 'USER' },
      ]} />
      {error && <ErrorState message={error} />}
      {loading ? <TableSkeleton /> : <DataTable columns={columns} data={rows} />}
      <Modal open={Boolean(selected)} title="User Details" onClose={() => setSelected(null)}>
        {selected && <div className="space-y-2 text-sm"><p><b>Name:</b> {selected.name}</p><p><b>Email:</b> {selected.email}</p><p><b>Phone:</b> {selected.phone}</p><p><b>Role:</b> {selected.role}</p><p><b>Verified Seller:</b> {selected.isVerifiedSeller ? 'Yes' : 'No'}</p></div>}
      </Modal>
      <ConfirmModal open={Boolean(confirm)} danger title="Remove User Row" message={`The backend has no delete-user endpoint yet. Remove ${confirm?.name} from this view only?`} onCancel={() => setConfirm(null)} onConfirm={() => { updateRecords((items) => items.filter((item) => item.id !== confirm.id)); setConfirm(null); toast.success('User removed from current view'); }} confirmLabel="Remove" />
    </>
  );
}


