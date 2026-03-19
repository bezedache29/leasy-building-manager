<?php

namespace App\Services;

use App\Models\Lease;

class DashboardAlertService
{
    public function getAlerts(): array
    {
        $alerts = [];

        $activeLeases = Lease::with(['property', 'tenants.documents'])
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

        return $alerts;
    }
}
