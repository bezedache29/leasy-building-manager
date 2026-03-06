<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Tenant;
use App\Services\DashboardAlertService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(DashboardAlertService $alerts)
    {
        // 1. Comptage réel depuis la base de données
        $propertiesCount = Property::count();
        $totalTenants = Tenant::count();

        // On considère un dossier complet s'il a au moins un document lié
        $completeTenantsCount = Tenant::has('documents')->count();
        $incompleteTenantsCount = $totalTenants - $completeTenantsCount;

        // 2. Envoi des données à la vue React
        return Inertia::render('Dashboard', [
            'alerts' => $alerts->getAlerts(),
            'stats' => [
                'properties' => $propertiesCount, // Nb total de biens
                'total_tenants' => $totalTenants, // Nb total de locataires
                // TODO: À brancher quand la table Leases sera là
                'active_leases' => 0, // Nb total de location en cours
                'complete_tenants' => $completeTenantsCount, // Nb de dossiers locataire complets
                'incomplete_tenants' => $incompleteTenantsCount, // Nb de dossiers locataire incomplets
                // TODO: À brancher quand la table  sera là
                'inventories_archived' => 0, // Nb d'états des lieux passés et terminés
                // TODO: À brancher quand la table  sera là
                'inventories_active' => 0, //  Nb d'états des lieux prévus ou en cours
                // TODO: À brancher quand la table  sera là
                'rent_monthly_total' => 0, // Sommes totales des loyers mensuels
                // TODO: À brancher quand la table  sera là
                'receipts_count' => 0, // Nb de quittances de loyer générées
                // TODO: À brancher quand la table  sera là
                'legal_active_cases' => 0, // Nb de dossiers contentieux ou sinistres en cours
            ]
        ]);
    }
}
