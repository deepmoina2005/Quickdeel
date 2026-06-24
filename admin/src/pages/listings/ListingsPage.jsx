import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, Star, Tag, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
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

const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=240&auto=format&fit=crop';

export default function ListingsPage() {
  const loader = useCallback(() => adminService.getListings({ page: 1, limit: 50 }), []);
  const { data, setData, loading } = useAdminData(loader, { data: [] });
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

  const rows = useMemo(() => records.map((item) => ({
    ...item,
    categoryName: item.category?.name || item.category || '-',
    sellerName: item.user?.name || item.seller || '-',
    image: mediaUrl(item.images?.[0]?.imageUrl || item.image, fallbackImage),
    price: typeof item.price === 'number' ? `₹${item.price.toLocaleString('en-IN')}` : `₹${Number(item.price || 0).toLocaleString('en-IN')}`,
    createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-',
  })).filter((item) => {
    const matchesSearch = [item.title, item.categoryName, item.sellerName].join(' ').toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (filter === 'All' || item.status === filter);
  }), [records, search, filter]);

  const markSold = async (row) => {
    const listing = await adminService.markListingSold(row.id);
    updateRecords((items) => items.map((item) => item.id === row.id ? { ...item, ...listing } : item));
    toast.success('Listing marked as sold');
  };

  const columns = [
    { key: 'image', header: 'Image', render: (row) => <ImageWithFallback src={row.image} alt={row.title} className="h-12 w-16 rounded-md object-cover" /> },
    { key: 'title', header: 'Title' },
    { key: 'categoryName', header: 'Category' },
    { key: 'sellerName', header: 'Seller' },
    { key: 'price', header: 'Price' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'createdAt', header: 'Created Date' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" className="admin-action-button h-11 w-11 px-0" onClick={() => setSelected(row)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" className="admin-action-button h-11 w-11 px-0" onClick={() => markSold(row)}><Tag className="h-4 w-4" /></Button>
          <Button variant="ghost" className="admin-action-button h-11 w-11 px-0" onClick={() => { updateRecords((items) => items.map((item) => item.id === row.id ? { ...item, featured: !item.featured } : item)); toast.success('Featured flag updated locally; backend field is not available yet'); }}><Star className={`h-4 w-4 ${row.featured ? 'fill-amber-400 text-amber-400' : ''}`} /></Button>
          <Button variant="ghost" className="admin-action-button h-11 w-11 px-0 text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200" onClick={() => setConfirm(row)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Listings" description="View all listings, delete, feature, and mark listings as sold." />
      <SearchFilterBar search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} placeholder="Search listings" filterOptions={[
        { label: 'All Listings', value: 'All' }, { label: 'Published', value: 'APPROVED' }, { label: 'Sold', value: 'SOLD' },
      ]} />
      {loading ? <TableSkeleton /> : <DataTable columns={columns} data={rows} />}
      <Modal open={Boolean(selected)} title="Listing Details" onClose={() => setSelected(null)}>
        {selected && <div className="space-y-3 text-sm"><ImageWithFallback src={selected.image} alt={selected.title} className="h-40 w-full rounded-md object-cover" /><p><b>Title:</b> {selected.title}</p><p><b>Seller:</b> {selected.sellerName}</p><p><b>Category:</b> {selected.categoryName}</p><p><b>Price:</b> {selected.price}</p><p className="flex items-center gap-2"><b>Status:</b> <StatusBadge status={selected.status} /></p></div>}
      </Modal>
      <ConfirmModal open={Boolean(confirm)} danger title="Delete Listing" message={`Delete ${confirm?.title}?`} onCancel={() => setConfirm(null)} onConfirm={async () => { await adminService.deleteListing(confirm.id); updateRecords((items) => items.filter((item) => item.id !== confirm.id)); setConfirm(null); toast.success('Listing deleted'); }} confirmLabel="Delete" />
    </>
  );
}


