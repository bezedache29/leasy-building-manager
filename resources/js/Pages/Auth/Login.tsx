import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

export default function Login({
  status,
  canResetPassword,
}: {
  status?: string;
  canResetPassword: boolean;
}) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    post(route('login'), { onFinish: () => reset('password') });
  };

  return (
    <GuestLayout>
      <Head title="Connexion" />

      <div className="mb-6">
        <div className="text-2xl font-semibold">Leasy</div>
        <div className="text-sm text-muted">Connexion à l’espace privé</div>
      </div>

      {status && (
        <div className="mb-4 rounded-md border border-app bg-surface-2 p-3 text-sm text-muted">
          {status}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <InputLabel htmlFor="email" value="Email" />
          <TextInput
            id="email"
            type="email"
            name="email"
            value={data.email}
            className="mt-1 block w-full"
            autoComplete="username"
            onChange={(e) => setData('email', e.target.value)}
          />
          <InputError message={errors.email} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="password" value="Mot de passe" />
          <TextInput
            id="password"
            type="password"
            name="password"
            value={data.password}
            className="mt-1 block w-full"
            autoComplete="current-password"
            onChange={(e) => setData('password', e.target.value)}
          />
          <InputError message={errors.password} className="mt-2" />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted">
            <Checkbox
              name="remember"
              checked={data.remember}
              onChange={(e) => setData('remember', e.target.checked)}
            />
            Se souvenir de moi
          </label>

          {canResetPassword && (
            <Link href={route('password.request')} className="text-sm text-primary hover:underline">
              Mot de passe oublié ?
            </Link>
          )}
        </div>

        <PrimaryButton
          className="w-full justify-center bg-primary text-white"
          disabled={processing}
        >
          Connexion
        </PrimaryButton>
      </form>
    </GuestLayout>
  );
}
