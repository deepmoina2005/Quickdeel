import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Edit, FolderTree, Plus, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import PageHeader from '../../components/common/PageHeader';
import SearchFilterBar from '../../components/common/SearchFilterBar';
import { TableSkeleton } from '../../components/common/Skeleton';
import CategoryForm from '../../components/forms/CategoryForm';
import ConfirmModal from '../../components/modals/ConfirmModal';
import Modal from '../../components/modals/Modal';
import DataTable from '../../components/tables/DataTable';
import { useAdminData } from '../../hooks/useAdminData';
import { adminService } from '../../services/admin.service';
import { mediaUrl } from '../../utils/media';

const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=240&auto=format&fit=crop';

export default function CategoriesPage() {
  const loader = useCallback(() => adminService.getCategories(), []);
  const { data, setData, loading } = useAdminData(loader, []);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const rows = useMemo(() => data.filter(Boolean).map((item) => ({
    ...item,
    name: item.name || 'Untitled Category',
    image: mediaUrl(item.image, fallbackImage),
    createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-',
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-',
  })).filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [data, search]);

  const saveCategory = async (values) => {
    try {
      const category = modal?.id
        ? await adminService.updateCategory(modal.id, values)
        : await adminService.createCategory(values);

      if (!category?.id) {
        throw new Error('Backend did not return a saved category');
      }

      const freshCategories = await adminService.getCategories();
      setData(freshCategories);
      toast.success(modal?.id ? 'Category updated' : 'Category created');
      setModal(null);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to save category');
    }
  };

  const columns = [
    { key: 'image', header: 'Image', render: (row) => <ImageWithFallback src={row.image} alt={row.name} className="h-12 w-16 rounded-md object-cover" /> },
    { key: 'name', header: 'Name', render: (row) => <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-md bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100"><FolderTree className="h-4 w-4" /></span><span className="font-semibold">{row.name}</span></div> },
    { key: 'createdAt', header: 'Created Date' },
    { key: 'updatedAt', header: 'Updated Date' },
    { key: 'actions', header: 'Actions', render: (row) => <div className="flex gap-1"><Button variant="ghost" className="admin-action-button h-11 w-11 px-0" onClick={() => setModal(row)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" className="admin-action-button h-11 w-11 px-0 text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200" onClick={() => setConfirm(row)}><Trash2 className="h-4 w-4" /></Button></div> },
  ];

  return (
    <>
      <PageHeader title="Categories" description="Create, update, upload images, and delete marketplace categories." actions={<Button onClick={() => setModal({})}><Plus className="h-4 w-4" /> Create Category</Button>} />
      <SearchFilterBar search={search} onSearch={setSearch} placeholder="Search categories" />
      {loading ? <TableSkeleton /> : <DataTable columns={columns} data={rows} />}
      <Modal open={Boolean(modal)} title={modal?.id ? 'Edit Category' : 'Create Category'} onClose={() => setModal(null)}>
        <CategoryForm defaultValues={modal || {}} onSubmit={saveCategory} submitLabel={modal?.id ? 'Update Category' : 'Create Category'} />
      </Modal>
      <ConfirmModal open={Boolean(confirm)} danger title="Delete Category" message={`Delete ${confirm?.name}?`} onCancel={() => setConfirm(null)} onConfirm={async () => { await adminService.deleteCategory(confirm.id); setData((items) => items.filter((item) => item.id !== confirm.id)); setConfirm(null); toast.success('Category deleted'); }} confirmLabel="Delete" />
    </>
  );
}
