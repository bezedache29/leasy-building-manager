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
use Illuminate\Support\Facades\URL;
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

        // Pas d'acte à générer pour une garantie Visale
        abort_if($guarantor->type === 'visale', 403, 'La garantie Visale ne génère pas d\'acte de cautionnement.');

        // Utilisation de NumberFormatter pour ecrire les montants en toutes lettres
        $formatter = new \NumberFormatter('fr_FR', \NumberFormatter::SPELLOUT);
        $rentInWords = $formatter->format($lease->rent_amount);
        $chargesInWords = $formatter->format($lease->charges_amount);

        // Plafond d'engagement = 36 mois de loyer CC
        $monthlyTotal = $lease->rent_amount + $lease->charges_amount;
        $maxGuaranteeAmount = $monthlyTotal * 36;
        $maxGuaranteeInWords = $formatter->format($maxGuaranteeAmount);

        // Date anniversaire du bail = date de révision IRL
        $start = $lease->start_date;
        $revisionDay = (int) $start->format('j');
        $revisionLabel = ($revisionDay === 1 ? '1er' : $revisionDay) . ' '
            . $start->locale('fr')->translatedFormat('F');

        $pdf = Pdf::loadView('pdfs.guarantee', [
            'guarantor'           => $guarantor,
            'property'            => $lease->property,
            'tenants'             => $lease->tenants,
            'startDate'           => $lease->start_date,
            'rentAmount'          => $lease->rent_amount,
            'chargesAmount'       => $lease->charges_amount,
            'rentInWords'         => $rentInWords,
            'chargesInWords'      => $chargesInWords,
            'monthlyTotal'        => $monthlyTotal,
            'maxGuaranteeAmount'  => $maxGuaranteeAmount,
            'maxGuaranteeInWords' => $maxGuaranteeInWords,
            'revisionLabel'       => $revisionLabel,
        ]);

        // Optionnel : personnaliser le format du papier
        $pdf->setPaper('A4', 'portrait');

        // On formate le nom du fichier proprement
        $filename = "acte_caution_" . Str::slug($guarantor->last_name) . "_" . Str::slug($lease->property->name) . ".pdf";

        // Affichage direct dans le navigateur au lieu du téléchargement forcé
        return $pdf->stream($filename);
    }

    public function generateInventoryPdf(Lease $lease,  string $type = 'in')
    {
        if (!in_array($type, ['in', 'out'])) {
            abort(400, 'Le type d\'état des lieux doit être "in" (entrée) ou "out" (sortie).');
        }

        $lease->load(['tenants', 'property.rooms.equipments', 'property.documents' => fn($q) => $q->where('category', 'inventory_photo')]);

        $propertyDocs = $lease->property->documents;

        $rooms = $lease->property->rooms->map(function ($room) use ($propertyDocs) {
            // 1. On récupère les IDs de tous les équipements de cette pièce
            $equipmentIds = $room->equipments->pluck('id');

            // 2. On vérifie s'il y a des photos liées aux équipements de cette pièce
            $hasPhotos = $propertyDocs
                ->whereIn('equipment_id', $equipmentIds)
                ->count() > 0;

            // 3. On ne génère le QR Code QUE s'il y a des photos
            if ($hasPhotos) {
                // On génère une URL signée temporaire valable 24 heures (soit 1440 minutes)
                $destinationUrl = URL::temporarySignedRoute(
                    'properties.inventory',          // Le nom de ta route (défini dans web.php)
                    now()->addHours(24),             // L'expiration
                    [                                // Les paramètres de la route
                        'property' => $lease->property_id,
                        'room'     => $room->id
                    ]
                );

                $options = new QROptions([
                    'outputType'   => 'svg',
                    'eccLevel'     => 'L',
                    'outputBase64' => true,
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
            'propertyDocs' => $propertyDocs,
        ]);

        $fileName = 'EDL_' . ($type === 'in' ? 'Entree' : 'Sortie') . '_' . $lease->id . '.pdf';
        return $pdf->stream($fileName);
    }
}
