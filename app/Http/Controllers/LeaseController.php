<?php

namespace App\Http\Controllers;

use App\Models\Lease;
use App\Models\Property;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $properties = Property::orderBy('name')->get();

        $tenants = Tenant::whereDoesntHave('leases', function ($query) {
            $query->where('status', 'active');
        })->orderBy('last_name')->orderBy('first_name')->get();

        return inertia('Leases/Create', [
            'properties' => $properties,
            'tenants' => $tenants,
            'defaultPropertyId' => $request->query('property_id') ? (int) $request->query('property_id') : 0,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
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
            // Garantit qu'un ID n'apparaît qu'une seule fois dans le tableau
            'tenant_ids.*' => 'distinct|exists:tenants,id',
            'insurer_name' => 'nullable|string|max:255',
            'insurer_address' => 'nullable|string|max:255',
            'insurer_phone' => 'nullable|string|max:20',
            'keys_building_count' => 'required|integer|min:0',
            'keys_mailbox_count' => 'required|integer|min:0',
            'keys_apartment_count' => 'required|integer|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            // Verrouillage du bien pour éviter toute concurrence (le fameux FOR UPDATE)
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

            $unavailableTenantsExists = Tenant::whereIn('id', $tenantIds)
                ->whereHas('leases', function ($query) {
                    $query->where('status', 'active');
                })->exists();

            if ($unavailableTenantsExists) {
                return back()->withErrors([
                    'tenant_ids' => 'Un ou plusieurs locataires sélectionnés ont déjà un bail actif ailleurs.'
                ])->withInput();
            }

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

            $pivotData = [];
            foreach ($validated['tenant_ids'] as $index => $tenantId) {
                $pivotData[$tenantId] = ['is_main_tenant' => $index === 0];
            }

            $lease->tenants()->attach($pivotData);

            return redirect()->route('properties.show', $property->id)
                ->with('success', 'Le bail a été créé avec succès.');
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(Lease $lease)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Lease $lease)
    {
        $lease->load('tenants');

        $properties = Property::orderBy('name')->get();

        $tenants = Tenant::where(function ($query) use ($lease) {
            // Soit le locataire n'a pas de bail actif en cours...
            $query->whereDoesntHave('leases', function ($q) {
                $q->where('status', 'active');
            })
                // ... Soit il est lié au bail que l'on est en train d'éditer
                ->orWhereHas('leases', function ($q) use ($lease) {
                    $q->where('leases.id', $lease->id);
                });
        })->orderBy('last_name')->orderBy('first_name')->get();

        return inertia('Leases/Edit', [
            'lease' => $lease,
            'properties' => $properties,
            'tenants' => $tenants,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
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
            // Application de la même protection pour la mise à jour
            'tenant_ids.*' => 'distinct|exists:tenants,id',
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

            $unavailableTenantsExists = Tenant::whereIn('id', $tenantIds)
                ->whereHas('leases', function ($query) use ($lease) {
                    $query->where('status', 'active')
                        ->where('leases.id', '!=', $lease->id);
                })->exists();

            if ($unavailableTenantsExists) {
                return back()->withErrors([
                    'tenant_ids' => 'Un ou plusieurs locataires sélectionnés ont déjà un autre bail actif.'
                ])->withInput();
            }

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

            $pivotData = [];
            foreach ($validated['tenant_ids'] as $index => $tenantId) {
                $pivotData[$tenantId] = ['is_main_tenant' => $index === 0];
            }

            $lease->tenants()->sync($pivotData);

            return redirect()->route('properties.show', $property->id)
                ->with('success', 'Le bail a été mis à jour avec succès.');
        });
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Lease $lease)
    {
        //
    }

    public function terminate(Request $request, Lease $lease)
    {
        $validated = $request->validate([
            // On compare directement avec la date stockee dans le modele
            'end_date' => 'required|date|after_or_equal:' . $lease->start_date->toDateString(),
        ]);

        $lease->update([
            'end_date' => $validated['end_date'],
            'status' => $this->calculateLeaseStatus($lease->start_date, $validated['end_date']),
        ]);

        return back()->with('success', 'La cloture du bail a bien ete enregistree.');
    }

    /**
     * Determine le statut du bail en fonction de ses dates.
     */
    private function calculateLeaseStatus($startDate, $endDate): string
    {
        // Si une date de fin existe et qu'elle est strictement dans le passé
        if ($endDate && Carbon::parse($endDate)->startOfDay()->isPast()) {
            return 'terminated';
        }

        return 'active';
    }

    public function pdf(Lease $lease)
    {
        return "Le PDF du bail arrivera bientôt ici !";
    }
}
