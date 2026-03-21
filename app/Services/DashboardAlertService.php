<?php

namespace App\Services;

use App\Models\Lease;
use App\Models\Tenant;

class DashboardAlertService
{
    public function getAlerts(): array
    {
        $alerts = [];

        $activeLeases = Lease::with([
            'property',
            'tenants.documents',
            'tenants.guarantors.documents'
        ])
            ->where('status', 'active')
            ->get();

        foreach ($activeLeases as $lease) {
            // Si le bail signé est déjà uploadé, c'est terminé, on passe au suivant
            if ($lease->has_signed_lease) {
                continue;
            }

            // Le dossier est-il complet pour générer le PDF ?
            $isReadyToGenerate = empty($lease->missing_pdf_data);

            if ($isReadyToGenerate) {
                if (is_null($lease->pdf_downloaded_at)) {
                    // ÉTAPE 1 : Le PDF est prêt, mais pas encore téléchargé
                    $alerts[] = [
                        'key' => 'lease_ready_' . $lease->id,
                        'icon' => '📄',
                        'level' => 'success',
                        'title' => 'Le bail est prêt à être téléchargé pour : ' . $lease->property->name,
                        'action_url' => route('properties.show', $lease->property->id),
                    ];
                } else {
                    // ÉTAPE 2 : Le PDF a été téléchargé, on attend le retour signé
                    $alerts[] = [
                        'key' => 'lease_waiting_signature_' . $lease->id,
                        'icon' => '✍️',
                        'level' => 'warning',
                        'title' => 'En attente d\'upload du bail signé pour : ' . $lease->property->name,
                        'action_url' => route('properties.show', $lease->property->id),
                    ];
                }
            }
        }

        // On récupère les locataires avec leurs relations pour que l'attribut is_complete puisse faire ses calculs
        $tenants = Tenant::with(['documents', 'guarantors.documents'])->get();

        foreach ($tenants as $tenant) {
            if (!$tenant->is_complete) {
                $alerts[] = [
                    'key' => 'incomplete_tenant_' . $tenant->id,
                    'icon' => '⚠️',
                    'level' => 'warning', // S'affichera en orange (amber-400)
                    'title' => "Dossier incomplet pour le locataire : {$tenant->first_name} {$tenant->last_name}",
                    // On redirige vers la page d'édition pour pouvoir compléter le dossier
                    'action_url' => route('tenants.show', $tenant->id),
                ];
            }
        }

        return $alerts;
    }
}
