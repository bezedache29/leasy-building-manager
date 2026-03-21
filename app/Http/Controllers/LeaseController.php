<?php

namespace App\Http\Controllers;

use App\Models\Lease;
use App\Models\Property;
use App\Models\Tenant;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
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

        // AJOUT DU with('guarantors') POUR LE FRONTEND REACT
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
}
