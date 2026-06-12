import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import Button from '@/Components/Button';

export default function Login({ status }: { status?: string }) {
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
        <div className="text-2xl font-semibold text-app">Leasy</div>
        <div className="text-sm text-muted">Connexion à l’espace privé</div>
      </div>

      {status && (
        <div className="mb-4 rounded-md border border-[rgb(var(--border))] bg-surface-2 p-3 text-sm text-muted">
          {status}
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <div>
          <InputLabel htmlFor="email" value="Email" className="mb-1" />
          <TextInput
            id="email"
            type="email"
            name="email"
            value={data.email}
            className="block w-full"
            autoComplete="username"
            onChange={(e) => setData('email', e.target.value)}
          />
          {errors.email && <p className="mt-1 text-sm font-medium text-red-400">{errors.email}</p>}
        </div>

        <div>
          <InputLabel htmlFor="password" value="Mot de passe" className="mb-1" />
          <TextInput
            id="password"
            type="password"
            name="password"
            value={data.password}
            className="block w-full"
            autoComplete="current-password"
            onChange={(e) => setData('password', e.target.value)}
          />
          {errors.password && (
            <p className="mt-1 text-sm font-medium text-red-400">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 text-sm text-muted cursor-pointer hover:text-app transition-colors">
            <Checkbox
              name="remember"
              checked={data.remember}
              onChange={(e) => setData('remember', e.target.checked)}
            />
            Se souvenir de moi
          </label>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={processing}>
            Connexion
          </Button>
        </div>
      </form>
    </GuestLayout>
  );
}
