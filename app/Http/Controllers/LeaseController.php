<?php

namespace App\Http\Controllers;

use App\Models\Guarantor;
use App\Models\Lease;
use App\Models\Property;
use App\Models\Tenant;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LeaseController extends Controller
{
    public function index()
    {
        //
    }

    public function create(Request $request)
    {
        $properties = Property::orderBy('name')->get();

        $tenants = Tenant::with('guarantors')->orderBy('last_name')->orderBy('first_name')->get();

        return inertia('Leases/Create', [
            'properties' => $properties,
            'tenants' => $tenants,
            'defaultPropertyId' => $request->query('property_id') ? (int) $request->query('property_id') : 0,
            'defaultTenantId' => $request->query('tenant_id') ? (int) $request->query('tenant_id') : 0,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'rent_amount' => 'required|numeric|min:0',
            'charges_amount' => 'required|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
            'payment_day' => 'required|integer|min:1|max:31',
            'tenant_ids' => 'required|array|min:1',
            'tenant_ids.*' => 'distinct|exists:tenants,id',
            'guarantor_ids' => 'nullable|array',
            'guarantor_ids.*' => 'exists:guarantors,id',
            'insurer_name' => 'nullable|string|max:255',
            'insurer_address' => 'nullable|string|max:255',
            'insurer_phone' => 'nullable|string|max:20',
            'keys_building_count' => 'required|integer|min:0',
            'keys_mailbox_count' => 'required|integer|min:0',
            'keys_apartment_count' => 'required|integer|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $property = Property::lockForUpdate()->findOrFail($validated['property_id']);

            $activeLeaseExists = Lease::where('property_id', $property->id)
                ->where('status', 'active')
                ->exists();

            if ($activeLeaseExists) {
                return back()->withErrors([
                    'property_id' => 'Cet appartement possède déjà un bail en cours. Veuillez le clôturer avant d\'en créer un nouveau.'
                ])->withInput();
            }

            $tenantIds = $validated['tenant_ids'];
            Tenant::whereIn('id', $tenantIds)->lockForUpdate()->get(['id']);

            $lease = Lease::create([
                'property_id' => $property->id,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'] ?? null,
                'rent_amount' => $validated['rent_amount'],
                'charges_amount' => $validated['charges_amount'],
                'deposit_amount' => $validated['deposit_amount'] ?? null,
                'payment_day' => $validated['payment_day'],
                'status' => $this->calculateLeaseStatus($validated['start_date'], $validated['end_date'] ?? null),
                'insurer_name' => $validated['insurer_name'] ?? null,
                'insurer_address' => $validated['insurer_address'] ?? null,
                'insurer_phone' => $validated['insurer_phone'] ?? null,
                'keys_building_count' => $validated['keys_building_count'],
                'keys_mailbox_count' => $validated['keys_mailbox_count'],
                'keys_apartment_count' => $validated['keys_apartment_count'],
            ]);

            // Attachement des garants
            if (!empty($validated['guarantor_ids'])) {
                $lease->guarantors()->sync($validated['guarantor_ids']);
            }

            // Attachement des locataires
            $pivotData = [];
            foreach ($validated['tenant_ids'] as $index => $tenantId) {
                $pivotData[$tenantId] = ['is_main_tenant' => $index === 0];
            }
            $lease->tenants()->attach($pivotData);

            return redirect()->route('properties.show', $property->id)
                ->with('success', 'Le bail a été créé avec succès.');
        });
    }

    public function show(Lease $lease)
    {
        //
    }

    public function edit(Lease $lease)
    {
        $lease->load(['tenants.guarantors', 'guarantors']);

        $properties = Property::orderBy('name')->get();

        $tenants = Tenant::with('guarantors')->orderBy('last_name')->orderBy('first_name')->get();

        return inertia('Leases/Edit', [
            'lease' => $lease,
            'properties' => $properties,
            'tenants' => $tenants,
        ]);
    }

    public function update(Request $request, Lease $lease)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'rent_amount' => 'required|numeric|min:0',
            'charges_amount' => 'required|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
            'payment_day' => 'required|integer|min:1|max:31',
            'tenant_ids' => 'required|array|min:1',
            'tenant_ids.*' => 'distinct|exists:tenants,id',
            'guarantor_ids' => 'nullable|array',
            'guarantor_ids.*' => 'exists:guarantors,id',
            'insurer_name' => 'nullable|string|max:255',
            'insurer_address' => 'nullable|string|max:255',
            'insurer_phone' => 'nullable|string|max:20',
            'keys_building_count' => 'required|integer|min:0',
            'keys_mailbox_count' => 'required|integer|min:0',
            'keys_apartment_count' => 'required|integer|min:0',
        ]);

        return DB::transaction(function () use ($validated, $lease) {
            $property = Property::lockForUpdate()->find($validated['property_id']);

            $activeLeaseExists = Lease::where('property_id', $property->id)
                ->where('status', 'active')
                ->where('id', '!=', $lease->id)
                ->exists();

            if ($activeLeaseExists) {
                return back()->withErrors([
                    'property_id' => 'Cet appartement possède déjà un autre bail en cours.'
                ])->withInput();
            }

            $tenantIds = $validated['tenant_ids'];
            Tenant::whereIn('id', $tenantIds)->lockForUpdate()->get(['id']);

            $lease->update([
                'property_id' => $property->id,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'] ?? null,
                'rent_amount' => $validated['rent_amount'],
                'charges_amount' => $validated['charges_amount'],
                'deposit_amount' => $validated['deposit_amount'] ?? null,
                'payment_day' => $validated['payment_day'],
                'status' => $this->calculateLeaseStatus($validated['start_date'], $validated['end_date'] ?? null),
                'insurer_name' => $validated['insurer_name'] ?? null,
                'insurer_address' => $validated['insurer_address'] ?? null,
                'insurer_phone' => $validated['insurer_phone'] ?? null,
                'keys_building_count' => $validated['keys_building_count'],
                'keys_mailbox_count' => $validated['keys_mailbox_count'],
                'keys_apartment_count' => $validated['keys_apartment_count'],
            ]);

            // SAUVEGARDE DES GARANTS EN MODIFICATION
            if (isset($validated['guarantor_ids'])) {
                $lease->guarantors()->sync($validated['guarantor_ids']);
            } else {
                $lease->guarantors()->detach();
            }

            $pivotData = [];
            foreach ($validated['tenant_ids'] as $index => $tenantId) {
                $pivotData[$tenantId] = ['is_main_tenant' => $index === 0];
            }

            $lease->tenants()->sync($pivotData);

            return redirect()->route('properties.show', $property->id)
                ->with('success', 'Le bail a été mis à jour avec succès.');
        });
    }

    public function terminate(Request $request, Lease $lease)
    {
        $validated = $request->validate([
            'end_date' => 'required|date|after_or_equal:' . $lease->start_date->toDateString(),
        ]);

        $lease->update([
            'end_date' => $validated['end_date'],
            'status' => $this->calculateLeaseStatus($lease->start_date, $validated['end_date']),
        ]);

        return back()->with('success', 'La cloture du bail a bien ete enregistree.');
    }

    private function calculateLeaseStatus($startDate, $endDate): string
    {
        if ($endDate && Carbon::parse($endDate)->startOfDay()->isPast()) {
            return 'terminated';
        }

        return 'active';
    }

    public function pdf(Lease $lease)
    {
        // ON CHARGE DIRECTEMENT "guarantors" (ceux rattachés au bail) 
        // ET NON PLUS "tenants.guarantors"
        $lease->load(['property', 'tenants', 'guarantors']);

        if (is_null($lease->pdf_downloaded_at)) {
            $lease->update(['pdf_downloaded_at' => Carbon::now()]);
        }

        $pdf = Pdf::loadView('pdfs.lease', [
            'lease' => $lease
        ]);

        $filename = 'bail-' . Str::slug($lease->property->name) . '-' . date('Ymd') . '.pdf';

        return $pdf->stream($filename);
    }

    public function downloadGuarantee(Lease $lease, Guarantor $guarantor)
    {
        // On charge les relations necessaires
        $lease->load(['property', 'tenants', 'guarantors']);

        // On s'assure que le garant est bien lie a ce bail pour des raisons de securite
        abort_unless($lease->guarantors->contains($guarantor), 404);

        // Utilisation de NumberFormatter pour ecrire les montants en toutes lettres
        $formatter = new \NumberFormatter('fr_FR', \NumberFormatter::SPELLOUT);
        $rentInWords = $formatter->format($lease->rent_amount);
        $chargesInWords = $formatter->format($lease->charges_amount);

        // On calcule un plafond d'engagement arbitraire mais securisant (ex: 36 mois de loyer charges comprises)
        $monthlyTotal = $lease->rent_amount + $lease->charges_amount;
        $maxGuaranteeAmount = $monthlyTotal * 36;
        $maxGuaranteeInWords = $formatter->format($maxGuaranteeAmount);

        $pdf = Pdf::loadView('pdfs.guarantee', [
            'lease' => $lease,
            'guarantor' => $guarantor,
            'property' => $lease->property,
            'tenants' => $lease->tenants,
            'rentInWords' => $rentInWords,
            'chargesInWords' => $chargesInWords,
            'monthlyTotal' => $monthlyTotal,
            'maxGuaranteeAmount' => $maxGuaranteeAmount,
            'maxGuaranteeInWords' => $maxGuaranteeInWords,
        ]);

        // Optionnel : personnaliser le format du papier
        $pdf->setPaper('A4', 'portrait');

        // On formate le nom du fichier proprement
        $filename = "acte_caution_" . Str::slug($guarantor->last_name) . "_" . Str::slug($lease->property->name) . ".pdf";

        // Affichage direct dans le navigateur au lieu du téléchargement forcé
        return $pdf->stream($filename);
    }

    public function generateInventoryPdf(Lease $lease, $type = 'in')
    {
        $lease->load(['tenants', 'property.rooms.equipments', 'documents']);

        $baseUrl = config('app.url');

        $rooms = $lease->property->rooms->map(function ($room) use ($lease, $baseUrl, $type) {
            // 1. On récupère les IDs de tous les équipements de cette pièce
            $equipmentIds = $room->equipments->pluck('id');

            // 2. On compte s'il y a des photos liées à ces équipements pour ce bail
            $hasPhotos = $lease->documents
                ->whereIn('equipment_id', $equipmentIds)
                ->where('category', 'inventory_photo_' . $type)
                ->count() > 0;

            // 3. On ne génère le QR Code QUE s'il y a des photos
            if ($hasPhotos) {
                $destinationUrl = "{$baseUrl}/properties/{$lease->property_id}/inventory?room={$room->id}";

                $options = new QROptions([
                    'version'      => 5,
                    'outputType'   => 'svg',
                    'eccLevel'     => 'L',
                    'imageBase64'  => true,
                ]);

                try {
                    $room->qr_code_svg = (new QRCode($options))->render($destinationUrl);
                } catch (\Exception $e) {
                    $room->qr_code_svg = null;
                }
            } else {
                $room->qr_code_svg = null;
            }

            return $room;
        });

        $pdf = Pdf::loadView('pdfs.inventory', [
            'lease' => $lease,
            'type' => $type,
            'rooms' => $rooms,
        ]);

        $fileName = 'EDL_' . ($type === 'in' ? 'Entree' : 'Sortie') . '_' . $lease->id . '.pdf';
        return $pdf->stream($fileName);
    }
}
