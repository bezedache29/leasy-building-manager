import AppLayout from '@/Layouts/AppLayout';
import { ReactNode, useState } from 'react';
import Button from '@/Components/Button';
import IncompleteTenantsModal from '@/Pages/Dashboard/Partials/IncompleteTenantsModal';
import { Link } from '@inertiajs/react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

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
  signed_leases: number;
  properties_by_status: {
    vide: number;
    en_attente: number;
    loue: number;
  };
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

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  total: number;
  centerLabel: string;
}

function DonutChart({ data, total, centerLabel }: DonutChartProps) {
  const isEmpty = total === 0;
  const chartData = isEmpty
    ? [{ name: 'Aucun', value: 1, color: 'rgb(var(--border))' }]
    : data.filter((d) => d.value > 0);

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="relative w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={68}
              paddingAngle={isEmpty ? 0 : 2}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            {!isEmpty && (
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{
                  background: 'rgb(var(--surface))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'rgb(var(--text-app))',
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-app">{isEmpty ? '—' : total}</span>
          <span className="text-xs text-muted text-center leading-tight">{centerLabel}</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ alerts, stats }: { alerts: Alert[]; stats: DashboardStats }) {
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const totalTenants = stats.complete_tenants + stats.incomplete_tenants;

  const tenantChartData = [
    { name: 'Complets', value: stats.complete_tenants, color: '#10b981' },
    { name: 'Incomplets', value: stats.incomplete_tenants, color: '#f59e0b' },
  ];

  const propertyChartData = [
    { name: 'Loué', value: stats.properties_by_status.loue, color: '#10b981' },
    { name: 'En attente', value: stats.properties_by_status.en_attente, color: '#f59e0b' },
    { name: 'Vide', value: stats.properties_by_status.vide, color: '#94a3b8' },
  ];

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">Tableau de bord</h1>

      <AlertBox alerts={alerts} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Biens & Baux */}
        <Card title="🏢 Biens & Baux">
          <div className="flex-1 flex flex-col items-center justify-between gap-4">
            <DonutChart data={propertyChartData} total={stats.properties} centerLabel="bien(s)" />
            <div className="w-full space-y-1.5">
              {propertyChartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted">{item.name}</span>
                  </div>
                  <span className="font-semibold text-app">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="w-full pt-3 border-t border-[rgb(var(--border))]">
              <Button href={route('properties.index')} variant="secondary" className="w-full">
                Gérer l'immeuble
              </Button>
            </div>
          </div>
        </Card>

        {/* Dossiers locataires */}
        <Card title="👥 Dossiers locataires">
          <div className="flex-1 flex flex-col items-center justify-between gap-4">
            <DonutChart data={tenantChartData} total={totalTenants} centerLabel="locataire(s)" />
            <div className="w-full space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-muted">Complets</span>
                </div>
                <span className="font-semibold text-emerald-400">{stats.complete_tenants}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-muted">Incomplets</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-amber-400">{stats.incomplete_tenants}</span>
                  {stats.incomplete_tenants > 0 && (
                    <button
                      onClick={() => setShowIncompleteModal(true)}
                      className="text-xs text-amber-400 underline underline-offset-2 hover:text-amber-300"
                    >
                      Voir
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full pt-3 border-t border-[rgb(var(--border))]">
              <Button href={route('tenants.index')} variant="secondary" className="w-full">
                Gérer les locataires
              </Button>
            </div>
          </div>
        </Card>

        {/* Loyers */}
        <Card title="💸 Loyers">
          <div className="flex-1 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <div className="rounded-lg bg-surface-2 border border-[rgb(var(--border))] p-4 text-center">
                <p className="text-xs text-muted mb-1">Total mensuel charges comprises</p>
                <p className="text-3xl font-bold text-app">
                  {stats.rent_monthly_total > 0
                    ? `${stats.rent_monthly_total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`
                    : '—'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-400 shrink-0" />
                    <span className="text-muted">Baux actifs</span>
                  </div>
                  <span className="font-semibold text-app">{stats.active_leases}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-muted">Quittances disponibles</span>
                  </div>
                  <span
                    className={`font-semibold ${stats.signed_leases > 0 ? 'text-emerald-400' : 'text-muted'}`}
                  >
                    {stats.signed_leases > 0 ? stats.signed_leases : '—'}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-[rgb(var(--border))]">
              <Button href={route('properties.index')} variant="secondary" className="w-full">
                Gérer les biens
              </Button>
            </div>
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
