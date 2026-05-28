import AppLayout from '@/Layouts/AppLayout';
import { ReactNode, useState } from 'react';
import Button from '@/Components/Button';
import IncompleteTenantsModal from '@/Pages/Dashboard/Partials/IncompleteTenantsModal';
import { Link } from '@inertiajs/react';

type AlertLevel = 'success' | 'warning' | 'danger';

type Alert = {
  key: string;
  icon: string;
  level: AlertLevel;
  title: string;
  action_label?: string | null;
  action_url?: string | null;
};

interface DashboardStats {
  properties: number;
  active_leases: number;
  complete_tenants: number;
  incomplete_tenants: number;
  incomplete_tenants_list: Array<{
    id: number;
    full_name: string;
    email: string | null;
  }>;
  rent_monthly_total: number;
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-app bg-surface p-5 flex flex-col shadow-sm">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}

function AlertBox({ alerts }: { alerts: Alert[] }) {
  const levelClass: Record<AlertLevel, string> = {
    success: 'text-green-400',
    warning: 'text-orange-500',
    danger: 'text-red-500',
  };

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-[rgb(var(--border))] bg-surface-2 p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-app mb-3 flex items-center gap-2">
        <span>🔔</span> Alertes
      </h2>
      <ul className="space-y-1 text-sm">
        {alerts.map((alert) => {
          const content = (
            <>
              <span className="text-base">{alert.icon}</span>
              <span className="flex-1">{alert.title}</span>
              {alert.action_url && (
                <span className="text-xs opacity-0 transition-opacity group-hover:opacity-100">
                  Voir ➔
                </span>
              )}
            </>
          );

          return (
            <li key={alert.key}>
              {alert.action_url ? (
                <Link
                  href={alert.action_url}
                  className={`group flex items-center gap-2 font-medium p-2 -mx-2 rounded-lg transition-colors hover:bg-[rgb(var(--border))]/30 ${levelClass[alert.level]}`}
                >
                  {content}
                </Link>
              ) : (
                <div
                  className={`flex items-center gap-2 font-medium p-2 -mx-2 ${levelClass[alert.level]}`}
                >
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Dashboard({ alerts, stats }: { alerts: Alert[]; stats: DashboardStats }) {
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const totalTenants = stats.complete_tenants + stats.incomplete_tenants;
  const completePercent =
    totalTenants > 0 ? Math.round((stats.complete_tenants / totalTenants) * 100) : 0;

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">Tableau de bord</h1>

      <AlertBox alerts={alerts} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card title="🏢 Biens & Baux">
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted">Biens enregistrés</span>
              <span className="text-lg font-bold text-app">{stats.properties}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted">Baux actifs</span>
              <span className="text-lg font-bold text-app">{stats.active_leases}</span>
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-[rgb(var(--border))]">
            <Button href={route('properties.index')} variant="secondary" className="w-full">
              Gérer l'immeuble
            </Button>
          </div>
        </Card>

        <Card title="👥 Dossiers locataires">
          <div className="mb-5 flex items-end gap-2">
            <span className="text-3xl font-bold text-app">{totalTenants}</span>
            <span className="mb-1 text-sm font-medium text-muted">locataire(s)</span>
          </div>

          <div className="mt-auto pt-2">
            {totalTenants > 0 ? (
              <div className="space-y-3">
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    style={{ width: `${completePercent}%` }}
                    className="bg-emerald-500 transition-all duration-500"
                  />
                  <div
                    style={{ width: `${100 - completePercent}%` }}
                    className="bg-amber-500 transition-all duration-500"
                  />
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-emerald-400">
                      {stats.complete_tenants} complets
                    </span>
                  </div>
                  {stats.incomplete_tenants > 0 ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <span className="font-medium text-amber-400">
                          {stats.incomplete_tenants} incomplets
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="warning"
                        size="sm"
                        onClick={() => setShowIncompleteModal(true)}
                        className="px-2 py-0.5 text-xs h-auto"
                      >
                        Voir
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted flex items-center gap-1 italic">
                      Tous complets ! 🎉
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-surface-2 p-3 text-center border border-[rgb(var(--border))]">
                <p className="text-sm text-muted italic">Aucun locataire pour le moment.</p>
              </div>
            )}
          </div>
        </Card>

        <Card title="💸 Loyers">
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted">Total mensuel (CC)</span>
              <span className="text-lg font-bold text-app">
                {stats.rent_monthly_total > 0 ? `${stats.rent_monthly_total.toFixed(2)} €` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted">Baux actifs</span>
              <span className="text-lg font-bold text-app">{stats.active_leases}</span>
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-[rgb(var(--border))]">
            <p className="text-xs text-muted italic text-center">
              Quittances disponibles après implémentation
            </p>
          </div>
        </Card>
      </div>

      <IncompleteTenantsModal
        show={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
        tenants={stats.incomplete_tenants_list}
      />
    </AppLayout>
  );
}
