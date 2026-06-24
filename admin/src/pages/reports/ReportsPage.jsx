import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, Eye, ShieldAlert, Trash2, UserX } from 'lucide-react';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import { TableSkeleton } from '../../components/common/Skeleton';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/modals/Modal';
import DataTable from '../../components/tables/DataTable';
import { useAdminData } from '../../hooks/useAdminData';
import { adminService } from '../../services/admin.service';

const parseReason = (value = '') => {
  const [reason, ...detailParts] = String(value).split('\n\n');
  return {
    reason,
    detail: detailParts.join('\n\n'),
  };
};

export default function ReportsPage() {
  const loader = useCallback(() => adminService.getReports(), []);
  const { data, setData, loading } = useAdminData(loader, []);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const records = Array.isArray(data) ? data : data?.data || [];

  const updateRecords = (updater) => setData((current) => {
    const currentRows = Array.isArray(current) ? current : current?.data || [];
    const nextRows = updater(currentRows);
    return Array.isArray(current) ? nextRows : { ...current, data: nextRows };
  });

  const rows = useMemo(() => records.map((item) => ({
    ...item,
    ...parseReason(item.reason),
    listingTitle: item.listing?.title || item.listing || 'Reported user',
    reporterName: item.user?.name || item.reporter || '-',
    reportedUserName: item.reportedUser?.name || '-',
    createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-',
  })).filter((item) => filter === 'All' || item.status === filter), [records, filter]);

  const resolveReport = async (row) => {
    const report = await adminService.updateReport(row.id, 'REVIEWED');
    updateRecords((items) => items.map((item) => item.id === row.id ? { ...item, ...report } : item));
    toast.success('Report resolved');
  };

  const removeListing = async (row) => {
    if (!row.listingId) {
      toast.error('This report is not attached to a listing');
      return;
    }
    await adminService.deleteListing(row.listingId);
    await adminService.updateReport(row.id, 'REVIEWED');
    updateRecords((items) => items.map((item) => item.id === row.id ? { ...item, status: 'REVIEWED' } : item));
    toast.success('Listing removed and report reviewed');
  };

  const columns = [
    { key: 'listingTitle', header: 'Reported Item' },
    { key: 'reporterName', header: 'Reporter' },
    { key: 'reportedUserName', header: 'Reported User' },
    { key: 'reason', header: 'Reason' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', header: 'Created Date' },
    { key: 'actions', header: 'Actions', render: (row) => <div className="flex gap-1"><Button variant="ghost" className="admin-action-button h-11 w-11 px-0" onClick={() => setSelected(row)}><Eye className="h-4 w-4" /></Button><Button variant="ghost" className="admin-action-button h-11 w-11 px-0" onClick={() => resolveReport(row)}><CheckCircle className="h-4 w-4" /></Button><Button variant="ghost" className="admin-action-button h-11 w-11 px-0" onClick={() => removeListing(row)}><Trash2 className="h-4 w-4" /></Button><Button variant="ghost" className="admin-action-button h-11 w-11 px-0 text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200" onClick={() => toast.error('Suspend user API is not available in the backend yet')}><UserX className="h-4 w-4" /></Button></div> },
  ];

  return (
    <>
      <PageHeader title="Reports" description="View reported listings and users, resolve reports, and remove reported listings." />
      <SearchFilterBar search="" onSearch={() => {}} filter={filter} onFilter={setFilter} placeholder="Search reports" filterOptions={[
        { label: 'All Reports', value: 'All' }, { label: 'Open', value: 'OPEN' }, { label: 'Reviewed', value: 'REVIEWED' }, { label: 'Dismissed', value: 'DISMISSED' },
      ]} />
      {loading ? <TableSkeleton /> : <DataTable columns={columns} data={rows} />}
      <Modal open={Boolean(selected)} title="Report Details" onClose={() => setSelected(null)}>
        {selected && <div className="space-y-3 text-sm"><ShieldAlert className="h-8 w-8 text-rose-500" /><p><b>Listing/User:</b> {selected.listingTitle}</p><p><b>Reporter:</b> {selected.reporterName}</p><p><b>Reported User:</b> {selected.reportedUserName}</p><p><b>Reason:</b> {selected.reason}</p>{selected.detail ? <p><b>Description:</b> {selected.detail}</p> : null}<p><b>Status:</b> {selected.status}</p></div>}
      </Modal>
    </>
  );
}


