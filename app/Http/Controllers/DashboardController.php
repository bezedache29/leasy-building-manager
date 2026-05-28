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

        $propertiesCount = Property::count();

        $activeLeases = Lease::where('status', 'active')->get();
        $activeLeasesCount = $activeLeases->count();
        $rentMonthlyTotal = round(
            $activeLeases->sum(fn($l) => $l->rent_amount + $l->charges_amount),
            2
        );

        return Inertia::render('Dashboard/Dashboard', [
            'alerts' => $alerts->getAlerts(),
            'stats' => [
                'properties'             => $propertiesCount,
                'active_leases'          => $activeLeasesCount,
                'complete_tenants'       => $completeTenantsCount,
                'incomplete_tenants'     => $incompleteTenantsCount,
                'incomplete_tenants_list' => $incompleteTenantsList,
                'rent_monthly_total'     => $rentMonthlyTotal,
            ]
        ]);
    }
}
