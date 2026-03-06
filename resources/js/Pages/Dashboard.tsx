import AppLayout from '@/Layouts/AppLayout';
import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

type AlertLevel = 'info' | 'warning' | 'danger';

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
  inventories_archived: number;
  inventories_active: number;
  rent_monthly_total: number;
  receipts_count: number;
  legal_active_cases: number;
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-app bg-surface p-5">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

function AlertBox({ alerts }: { alerts: Alert[] }) {
  const levelClass: Record<AlertLevel, string> = {
    info: 'text-blue-500',
    warning: 'text-orange-500',
    danger: 'text-red-500',
  };

  return (
    <div className="mb-6 rounded-xl border border-app bg-surface-2 p-4">
      <h2 className="text-lg font-semibold mb-3">🔔 Alertes</h2>
      <ul className="space-y-2 text-sm">
        {alerts.map((alert) => (
          <li key={alert.key} className={levelClass[alert.level]}>
            {alert.icon} {alert.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dashboard({ alerts, stats }: { alerts: Alert[]; stats: DashboardStats }) {
  return (
    <AppLayout>
      <Link
        href={route('tenants.create')}
        className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover"
      >
        + Nouveau Locataire
      </Link>
      <h1 className="text-2xl font-semibold mb-6">Tableau de bord</h1>

      <AlertBox alerts={alerts} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card title="🏢 Biens & Baux">
          <p className="text-muted text-sm">{stats.properties} biens</p>
          <p className="text-muted text-sm">{stats.active_leases} baux actifs</p>
        </Card>

        <Card title="👥 Dossiers locataires">
          <p className="text-green-500 text-sm">{stats.complete_tenants} dossier(s) complet(s)</p>
          {stats.incomplete_tenants > 0 ? (
            <p className="text-orange-500 text-sm">
              {stats.incomplete_tenants} dossier(s) incomplet(s)
            </p>
          ) : (
            <p className="text-muted text-sm">Pas de dossier incomplet</p>
          )}
        </Card>

        <Card title="🧾 États des lieux">
          <p className="text-muted text-sm">{stats.inventories_archived} archivés</p>
          <p className="text-muted text-sm">{stats.inventories_active} en cours</p>
        </Card>

        <Card title="💧 Charges annuelles">
          <p className="text-muted text-sm">Année 2025</p>
          <p className="text-muted text-sm">Eau en cours</p>
        </Card>

        <Card title="💸 Loyers & Quittances">
          <p className="text-muted text-sm">Loyers {stats.rent_monthly_total} € / mois</p>
          <p className="text-muted text-sm">{stats.receipts_count} quittances</p>
        </Card>

        <Card title="⚖️ Justice & Assurance">
          <p className="text-muted text-sm">{stats.legal_active_cases} dossier actif</p>
          <p className="text-muted text-sm">Aucun sinistre récent</p>
        </Card>
      </div>
    </AppLayout>
  );
}
