import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Button from '@/Components/Button';
import { Tenant } from '@/Types/tenant';

interface Props {
  tenants: Tenant[];
  showArchived: boolean;
}

export default function Index({ tenants, showArchived }: Props) {
  const toggleArchived = () => {
    router.get(
      route('tenants.index'),
      { show_archived: showArchived ? undefined : '1' },
      { preserveState: false }
    );
  };

  return (
    <AppLayout>
      <Head title="Locataires" />

      <div className="mx-auto max-w-5xl pb-12">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-app">Locataires</h1>
            {showArchived && (
              <span className="inline-flex items-center rounded-full bg-surface-2 border border-[rgb(var(--border))] px-2.5 py-0.5 text-xs font-medium text-muted">
                Archivés
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={toggleArchived}>
              {showArchived ? '← Locataires actifs' : 'Voir les archivés'}
            </Button>
            {!showArchived && (
              <Link href={route('tenants.create')}>
                <Button variant="primary">+ Nouveau locataire</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[rgb(var(--border))] bg-surface shadow-sm overflow-hidden">
          {tenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              {showArchived ? (
                <p className="text-muted">Aucun dossier archivé.</p>
              ) : (
                <>
                  <p className="mb-4 text-muted">
                    Aucun dossier locataire n'a été créé pour le moment.
                  </p>
                  <Link href={route('tenants.create')}>
                    <Button>Créer mon premier dossier</Button>
                  </Link>
                </>
              )}
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
                  {tenants.map((tenant) => {
                    const activeLease = tenant.leases?.find((l) => l.status === 'active');
                    const hasActiveLease = !!activeLease;
                    const hasAnyLease = tenant.leases && tenant.leases.length > 0;

                    const buttonVariant =
                      !hasActiveLease && hasAnyLease
                        ? 'danger'
                        : tenant.is_complete
                          ? 'success'
                          : 'warning';

                    return (
                      <tr key={tenant.id} className="hover:bg-surface-2 transition-colors">
                        <td className="px-6 py-4 font-medium whitespace-nowrap">
                          {tenant.first_name} {tenant.last_name}
                        </td>
                        <td className="px-6 py-4 text-muted whitespace-nowrap">
                          <div>{tenant.email || '—'}</div>
                          <div>{tenant.phone || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {activeLease?.property ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              {activeLease.property.name}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-3 text-muted">
                              Aucun bail en cours
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link href={route('tenants.show', tenant.id)}>
                            <Button variant={buttonVariant} size="sm">
                              Voir
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
