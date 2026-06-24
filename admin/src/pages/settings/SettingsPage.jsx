import PageHeader from '../../components/common/PageHeader';
import SettingsForm from '../../components/forms/SettingsForm';

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Manage core site information and support contacts." />
      <SettingsForm />
    </>
  );
}
