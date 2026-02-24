<?php

namespace App\Services;

use Carbon\Carbon;

class DashboardAlertService
{
    public function getAlerts(): array
    {
        $alerts = [];

        // TODO : Mettre des alertes dynamiques
        // ⚠️ Pour l’instant on met des exemples statiques.
        // Ensuite on branchera sur la BDD (leases, inventories, documents...).

        $alerts[] = [
            'key' => 'lease.annual_due.studio',
            'icon' => '📅',
            'level' => 'warning',
            'title' => 'Échéance annuelle Studio dans 30 jours',
            'entity_type' => 'lease',
            'entity_id' => null,
            'action_label' => 'Voir',
            'action_url' => '#',
        ];

        $alerts[] = [
            'key' => 'inventory.entry_to_archive.t2',
            'icon' => '🧾',
            'level' => 'warning',
            'title' => 'EDL entrant T2 à archiver',
            'entity_type' => 'inventory',
            'entity_id' => null,
            'action_label' => 'Voir',
            'action_url' => '#',
        ];

        $alerts[] = [
            'key' => 'tenant.missing_docs.t2',
            'icon' => '📂',
            'level' => 'danger',
            'title' => 'Dossier T2 incomplet (2 pièces manquantes)',
            'entity_type' => 'tenant',
            'entity_id' => null,
            'action_label' => 'Voir',
            'action_url' => '#',
        ];

        $alerts[] = [
            'key' => 'lease.expiring.t3',
            'icon' => '📄',
            'level' => 'warning',
            'title' => 'Bail T3 arrive à échéance',
            'entity_type' => 'lease',
            'entity_id' => null,
            'action_label' => 'Voir',
            'action_url' => '#',
        ];

        return $alerts;
    }
}
