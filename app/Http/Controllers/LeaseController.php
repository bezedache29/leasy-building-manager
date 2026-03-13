<?php

namespace App\Http\Controllers;

use App\Models\Lease;
use App\Models\Property;
use App\Models\Tenant;
use Illuminate\Http\Request;

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
            'tenant_ids.*' => 'exists:tenants,id',
        ]);

        // Vérification de la règle métier : un seul bail actif par appartement
        $activeLeaseExists = Lease::where('property_id', $validated['property_id'])
            ->where('status', 'active')
            ->exists();

        if ($activeLeaseExists) {
            return back()->withErrors([
                'property_id' => 'Cet appartement possède déjà un bail en cours. Veuillez le clôturer avant d\'en créer un nouveau.'
            ])->withInput();
        }

        $lease = Lease::create([
            'property_id' => $validated['property_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'rent_amount' => $validated['rent_amount'],
            'charges_amount' => $validated['charges_amount'],
            'deposit_amount' => $validated['deposit_amount'] ?? null,
            'payment_day' => $validated['payment_day'],
            'status' => 'active',
        ]);

        $pivotData = [];
        foreach ($validated['tenant_ids'] as $index => $tenantId) {
            $pivotData[$tenantId] = ['is_main_tenant' => $index === 0];
        }

        $lease->tenants()->attach($pivotData);

        return redirect()->route('properties.show', $validated['property_id'])
            ->with('success', 'Le bail a été créé avec succès.');
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
            'tenant_ids.*' => 'exists:tenants,id',
        ]);

        // Vérification de la règle métier (en excluant le bail actuel)
        $activeLeaseExists = Lease::where('property_id', $validated['property_id'])
            ->where('status', 'active')
            ->where('id', '!=', $lease->id)
            ->exists();

        if ($activeLeaseExists) {
            return back()->withErrors([
                'property_id' => 'Cet appartement possède déjà un autre bail en cours.'
            ])->withInput();
        }

        $lease->update([
            'property_id' => $validated['property_id'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'rent_amount' => $validated['rent_amount'],
            'charges_amount' => $validated['charges_amount'],
            'deposit_amount' => $validated['deposit_amount'] ?? null,
            'payment_day' => $validated['payment_day'],
        ]);

        $pivotData = [];
        foreach ($validated['tenant_ids'] as $index => $tenantId) {
            $pivotData[$tenantId] = ['is_main_tenant' => $index === 0];
        }

        $lease->tenants()->sync($pivotData);

        return redirect()->route('properties.show', $validated['property_id'])
            ->with('success', 'Le bail a été mis à jour avec succès.');
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
        $request->validate([
            'end_date' => 'required|date|after_or_equal:' . $lease->start_date->toDateString(),
        ], [
            'end_date.after_or_equal' => 'La date de fin doit être ultérieure ou égale à la date de début.',
        ]);

        $lease->update([
            'end_date' => $request->end_date,
            'status' => 'terminated',
        ]);

        return back()->with('success', 'Le bail a été clôturé avec succès.');
    }
}
