import AppLayout from '@/Layouts/AppLayout';
import { ReactNode } from 'react';

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-app bg-surface p-5">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

function AlertBox() {
  return (
    <div className="mb-6 rounded-xl border border-app bg-surface-2 p-4">
      <h2 className="text-lg font-semibold mb-3">🔔 Alertes</h2>
      <ul className="space-y-2 text-sm">
        <li className="text-orange-500">📅 Échéance annuelle Studio dans 30 jours</li>
        <li className="text-orange-500">🧾 EDL entrant T2 à archiver</li>
        <li className="text-orange-500">📂 Dossier T2 incomplet (2 pièces manquantes)</li>
        <li className="text-orange-500">📄 Bail T3 arrive à échéance</li>
      </ul>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">Tableau de bord</h1>

      <AlertBox />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card title="🏢 Biens & Baux">
          <p className="text-muted text-sm">5 biens</p>
          <p className="text-muted text-sm">4 baux actifs</p>
        </Card>

        <Card title="👥 Dossiers locataires">
          <p className="text-green-500 text-sm">3 dossiers complets</p>
          <p className="text-orange-500 text-sm">1 dossier incomplet</p>
        </Card>

        <Card title="🧾 États des lieux">
          <p className="text-muted text-sm">4 archivés</p>
          <p className="text-muted text-sm">1 en cours</p>
        </Card>

        <Card title="💧 Charges annuelles">
          <p className="text-muted text-sm">Année 2025</p>
          <p className="text-muted text-sm">Eau en cours</p>
        </Card>

        <Card title="💸 Loyers & Quittances">
          <p className="text-muted text-sm">Loyers 2 560 € / mois</p>
          <p className="text-muted text-sm">12 quittances</p>
        </Card>
      </div>
    </AppLayout>
  );
}
