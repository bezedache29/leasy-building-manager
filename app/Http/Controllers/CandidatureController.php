<?php

namespace App\Http\Controllers;

use App\Models\Guarantor;
use App\Models\Property;
use App\Models\Tenant;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CandidatureController extends Controller
{
    /**
     * Génère un acte de cautionnement sans bail existant.
     * Utilisé lors de la phase de candidature, avant de choisir un locataire.
     */
    public function generateActe(Request $request, Property $property)
    {
        $validated = $request->validate([
            'tenant_ids'   => 'required|array|min:1',
            'tenant_ids.*' => 'integer|exists:tenants,id',
            'guarantor_id' => 'required|integer|exists:guarantors,id',
            'rent_amount'  => 'required|numeric|min:0',
            'charges_amount' => 'nullable|numeric|min:0',
        ]);

        $tenants   = Tenant::whereIn('id', $validated['tenant_ids'])->get();
        $guarantor = Guarantor::findOrFail($validated['guarantor_id']);

        // Vérification que le garant appartient bien à l'un des locataires sélectionnés
        $isBound = Tenant::whereIn('id', $validated['tenant_ids'])
            ->whereHas('guarantors', fn($q) => $q->where('guarantors.id', $guarantor->id))
            ->exists();

        abort_unless($isBound, 403, 'Ce garant n\'est pas lié aux locataires sélectionnés.');

        $formatter     = new \NumberFormatter('fr_FR', \NumberFormatter::SPELLOUT);
        $rentAmount    = (float) $validated['rent_amount'];
        $chargesAmount = (float) ($validated['charges_amount'] ?? 0);
        $monthlyTotal  = $rentAmount + $chargesAmount;
        $maxGuarantee  = $monthlyTotal * 36;

        $pdf = Pdf::loadView('pdfs.guarantee', [
            'guarantor'           => $guarantor,
            'property'            => $property,
            'tenants'             => $tenants,
            'startDate'           => null,
            'rentAmount'          => $rentAmount,
            'chargesAmount'       => $chargesAmount,
            'rentInWords'         => $formatter->format($rentAmount),
            'chargesInWords'      => $formatter->format($chargesAmount),
            'monthlyTotal'        => $monthlyTotal,
            'maxGuaranteeAmount'  => $maxGuarantee,
            'maxGuaranteeInWords' => $formatter->format($maxGuarantee),
            'revisionLabel'       => null,
        ]);

        $pdf->setPaper('A4', 'portrait');

        $filename = 'acte_caution_candidature_'
            . Str::slug($guarantor->last_name) . '_'
            . Str::slug($property->name) . '.pdf';

        return $pdf->stream($filename);
    }
}
