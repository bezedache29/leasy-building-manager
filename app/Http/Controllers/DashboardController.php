<?php

namespace App\Http\Controllers;

use App\Models\Lease;
use App\Models\Tenant;
use App\Models\Property;
use App\Services\DashboardAlertService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(DashboardAlertService $alerts)
    {
        $tenants = Tenant::with(['documents', 'guarantors.documents'])->get();

        $completeTenantsCount = $tenants->where('is_complete', true)->count();
        $incompleteTenantsCount = $tenants->where('is_complete', false)->count();
        $incompleteTenantsList = $tenants->where('is_complete', false)->map(function ($tenant) {
            return [
                'id' => $tenant->id,
                'full_name' => $tenant->first_name . ' ' . $tenant->last_name,
                'email' => $tenant->email,
            ];
        })->values();

        $activeLeases = Lease::with('documents')->where('status', 'active')->get();
        $activeLeasesCount = $activeLeases->count();
        $rentMonthlyTotal = round(
            $activeLeases->sum(fn($l) => $l->rent_amount + $l->charges_amount),
            2
        );
        $signedLeasesCount = $activeLeases
            ->filter(fn($l) => $l->has_signed_lease && $l->has_signed_inventory)
            ->count();

        // Statut des biens : vide / en attente de signature / loué
        $properties = Property::with(['leases' => fn($q) => $q->where('status', 'active')->with('documents')])->get();
        $propertiesCount = $properties->count();

        $propertiesByStatus = [
            'vide'      => 0,
            'en_attente' => 0,
            'loue'      => 0,
        ];
        foreach ($properties as $property) {
            $activeLease = $property->leases->first();
            if (!$activeLease) {
                $propertiesByStatus['vide']++;
            } elseif ($activeLease->has_signed_lease && $activeLease->has_signed_inventory) {
                $propertiesByStatus['loue']++;
            } else {
                $propertiesByStatus['en_attente']++;
            }
        }

        return Inertia::render('Dashboard/Dashboard', [
            'alerts' => $alerts->getAlerts(),
            'stats' => [
                'properties'             => $propertiesCount,
                'active_leases'          => $activeLeasesCount,
                'complete_tenants'       => $completeTenantsCount,
                'incomplete_tenants'     => $incompleteTenantsCount,
                'incomplete_tenants_list' => $incompleteTenantsList,
                'rent_monthly_total'     => $rentMonthlyTotal,
                'signed_leases'          => $signedLeasesCount,
                'properties_by_status'   => $propertiesByStatus,
            ]
        ]);
    }
}
