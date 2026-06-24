import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import { settingsSchema } from '../../validations/forms.schema';

export default function SettingsForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: 'QuickDeal',
      contactEmail: 'support@quickdeal.in',
      supportNumber: '+91 98765 43210',
      terms: 'Users must follow marketplace rules, post accurate listings, and complete transactions responsibly.',
      privacyPolicy: 'QuickDeal collects account and listing data only to operate and improve the marketplace experience.',
    },
  });

  return (
    <form className="max-w-2xl space-y-5 rounded-md border bg-white p-5 shadow-sm dark:bg-slate-900" onSubmit={handleSubmit(() => toast.success('Settings saved'))}>
      <Input label="Site Name" error={errors.siteName?.message} {...register('siteName')} />
      <Input label="Site Logo" type="file" accept="image/*" {...register('siteLogo')} />
      <Input label="Contact Email" error={errors.contactEmail?.message} {...register('contactEmail')} />
      <Input label="Support Number" error={errors.supportNumber?.message} {...register('supportNumber')} />
      <Textarea label="Terms & Conditions" error={errors.terms?.message} {...register('terms')} />
      <Textarea label="Privacy Policy" error={errors.privacyPolicy?.message} {...register('privacyPolicy')} />
      <Button type="submit"><Save className="h-4 w-4" /> Save Settings</Button>
    </form>
  );
}
