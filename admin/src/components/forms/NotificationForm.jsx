import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import { notificationSchema } from '../../validations/forms.schema';

export default function NotificationForm({ onSubmit }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: { audience: 'All Users' },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input label="Title" error={errors.title?.message} {...register('title')} />
      <Select
        label="Audience"
        error={errors.audience?.message}
        options={[
          { label: 'All Users', value: 'All Users' },
          { label: 'Buyers', value: 'Buyers' },
          { label: 'Sellers', value: 'Sellers' },
        ]}
        {...register('audience')}
      />
      <Textarea label="Message" error={errors.message?.message} {...register('message')} />
      <div className="flex justify-end">
        <Button type="submit"><Send className="h-4 w-4" /> Send Notification</Button>
      </div>
    </form>
  );
}
