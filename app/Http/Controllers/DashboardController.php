<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Services\DashboardAlertService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(DashboardAlertService $alerts)
    {
        $tenants = Tenant::with(['documents', 'guarantors.documents'])->get();

        $totalTenants = $tenants->count();
        $completeTenantsCount = $tenants->where('is_complete', true)->count();
        $incompleteTenantsCount = $tenants->where('is_complete', false)->count();
        $incompleteTenantsList = $tenants->where('is_complete', false)->map(function ($tenant) {
            return [
                'id' => $tenant->id,
                'full_name' => $tenant->first_name . ' ' . $tenant->last_name,
                'email' => $tenant->email,
            ];
        })->values();

        return Inertia::render('Dashboard/Dashboard', [
            'alerts' => $alerts->getAlerts(),
            'stats' => [
                // TODO: À brancher quand la table Properties sera là
                'properties' => 0, // Nb total de biens

                'total_tenants' => $totalTenants, // Nb total de locataires

                // TODO: À brancher quand la table Leases sera là
                'active_leases' => 0, // Nb total de location en cours

                'complete_tenants' => $completeTenantsCount, // Nb de dossiers locataire complets
                'incomplete_tenants' => $incompleteTenantsCount, // Nb de dossiers locataire incomplets
                'incomplete_tenants_list' => $incompleteTenantsList,

                // TODO: À brancher quand la table sera là
                'inventories_archived' => 0, // Nb d'états des lieux passés et terminés

                // TODO: À brancher quand la table sera là
                'inventories_active' => 0, //  Nb d'états des lieux prévus ou en cours

                // TODO: À brancher quand la table sera là
                'rent_monthly_total' => 0, // Sommes totales des loyers mensuels

                // TODO: À brancher quand la table sera là
                'receipts_count' => 0, // Nb de quittances de loyer générées

                // TODO: À brancher quand la table sera là
                'legal_active_cases' => 0, // Nb de dossiers contentieux ou
            ]
        ]);
    }
}
