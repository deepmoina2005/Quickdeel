import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '../common/Button';
import Input from '../common/Input';
import { categorySchema } from '../../validations/forms.schema';

export default function CategoryForm({ defaultValues = {}, onSubmit, submitLabel = 'Save Category' }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      ...defaultValues,
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input label="Category Name" error={errors.name?.message} {...register('name')} />
      <Input label="Category Image" type="file" accept="image/*" {...register('image')} />
      <div className="flex justify-end">
        <Button type="submit"><Save className="h-4 w-4" /> {submitLabel}</Button>
      </div>
    </form>
  );
}
