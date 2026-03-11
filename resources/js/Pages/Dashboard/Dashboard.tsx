import AppLayout from '@/Layouts/AppLayout';
import { ReactNode, useState } from 'react';
import Button from '@/Components/Button';
import IncompleteTenantsModal from '@/Pages/Dashboard/Partials/IncompleteTenantsModal';

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
  incomplete_tenants_list: Array<{
    id: number;
    full_name: string;
    email: string | null;
  }>;
  inventories_archived: number;
  inventories_active: number;
  rent_monthly_total: number;
  receipts_count: number;
  legal_active_cases: number;
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
    info: 'text-blue-500',
    warning: 'text-orange-500',
    danger: 'text-red-500',
  };

  if (!alerts || alerts.length === 0) return null;

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
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  // Calculs pour la jauge des locataires
  const totalTenants = stats.complete_tenants + stats.incomplete_tenants;
  const completePercent =
    totalTenants > 0 ? Math.round((stats.complete_tenants / totalTenants) * 100) : 0;

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">Tableau de bord</h1>

      <AlertBox alerts={alerts} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* --- CARTE BIENS & BAUX MISE À JOUR --- */}
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
            {/* Utilisation de notre Button polymorphe qui génère un <Link> valide */}
            <Button href={route('properties.index')} variant="secondary" className="w-full">
              Gérer l'immeuble
            </Button>
          </div>
        </Card>

        <Card title="👥 Dossiers locataires">
          {/* Chiffre principal */}
          <div className="mb-5 flex items-end gap-2">
            <span className="text-3xl font-bold text-app">{totalTenants}</span>
            <span className="mb-1 text-sm font-medium text-muted">locataire(s) actif(s)</span>
          </div>

          <div className="mt-auto pt-2">
            {totalTenants > 0 ? (
              /* CAS AVEC DES LOCATAIRES : Affichage de la jauge */
              <div className="space-y-3">
                {/* La jauge */}
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    style={{ width: `${completePercent}%` }}
                    className="bg-emerald-500 transition-all duration-500"
                  ></div>
                  <div
                    style={{ width: `${100 - completePercent}%` }}
                    className="bg-amber-500 transition-all duration-500"
                  ></div>
                </div>

                {/* La légende */}
                <div className="flex justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span className="font-medium text-emerald-400">
                      {stats.complete_tenants} complets
                    </span>
                  </div>

                  {stats.incomplete_tenants > 0 ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500"></div>
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
              /* CAS SANS LOCATAIRE : Empty State */
              <div className="rounded-lg bg-surface-2 p-3 text-center border border-[rgb(var(--border))]">
                <p className="text-sm text-muted italic">Aucun locataire pour le moment.</p>
              </div>
            )}
          </div>
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

      <IncompleteTenantsModal
        show={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
        tenants={stats.incomplete_tenants_list}
      />
    </AppLayout>
  );
}
