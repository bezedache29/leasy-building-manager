<?php

namespace App\Http\Controllers;

use App\Services\DashboardAlertService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(DashboardAlertService $alerts)
    {
        return Inertia::render('Dashboard', [
            'alerts' => $alerts->getAlerts(),
        ]);
    }
}
