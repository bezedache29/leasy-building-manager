import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/Types';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
  mustVerifyEmail,
  status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
  const cardClass = 'rounded-xl border border-[rgb(var(--border))] bg-surface p-6 shadow-sm';

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold text-app">Mon profil</h1>

        <div className={cardClass}>
          <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
        </div>

        <div className={cardClass}>
          <UpdatePasswordForm />
        </div>

        <div className={cardClass}>
          <DeleteUserForm />
        </div>
      </div>
    </AppLayout>
  );
}
