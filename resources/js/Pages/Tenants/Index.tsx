import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import { Tenant } from '@/Types/tenant';

interface Props {
  tenants: Tenant[];
}

export default function Index({ tenants }: Props) {
  return (
    <AppLayout>
      <Head title="Locataires" />

      <div className="mx-auto max-w-5xl pb-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-app">Locataires</h1>

          <Link href={route('tenants.create')}>
            <Button variant="primary">+ Nouveau Locataire</Button>
          </Link>
        </div>

        <div className="rounded-xl border border-[rgb(var(--border))] bg-surface shadow-sm overflow-hidden">
          {tenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="mb-4 text-muted">
                Aucun dossier locataire n'a été créé pour le moment.
              </p>
              <Link href={route('tenants.create')}>
                <Button variant="secondary">Créer mon premier dossier</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-app">
                <thead className="border-b border-[rgb(var(--border))] bg-surface-2 text-xs uppercase text-muted">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-left">NOM COMPLET</th>
                    <th className="px-6 py-4 font-semibold text-left">CONTACT</th>
                    <th className="px-6 py-4 font-semibold text-left">BIEN</th>
                    <th className="px-6 py-4 font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--border))]">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-surface-2 transition-colors">
                      <td className="px-6 py-4 font-medium whitespace-nowrap">
                        {tenant.first_name} {tenant.last_name}
                      </td>
                      <td className="px-6 py-4 text-muted whitespace-nowrap">
                        <div>{tenant.email || '—'}</div>
                        <div>{tenant.phone || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgb(var(--primary-100))] text-[rgb(var(--primary-800))]">
                          {tenant.property?.name || 'Aucun bien'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link href={route('tenants.show', tenant.id)}>
                          <Button variant={tenant.is_complete ? 'primary' : 'warning'} size="sm">
                            Voir
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
