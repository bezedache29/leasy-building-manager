<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class PropertyController extends Controller
{
    public function index()
    {
        $properties = Property::orderBy('name')->get();

        return Inertia::render('Properties/Index', [
            'properties' => $properties
        ]);
    }

    public function create()
    {
        return Inertia::render('Properties/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', 'string', Rule::in(['studio', 'apartment', 'commercial', 'garage', 'other'])],
            'floor' => 'required|integer',
            'surface_area' => 'nullable|numeric|min:0',
            'tantiemes_water' => 'nullable|integer|min:0',
            'tantiemes_commons' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        Property::create($validated);

        return redirect()->route('properties.index')->with('success', 'Le bien a été ajouté avec succès.');
    }

    public function show(Property $property)
    {
        // On charge les pièces, équipements, et l'historique des baux.
        // On inclut les documents et garants pour éviter les requêtes N+1 lors du calcul du PDF.
        $property->load([
            'rooms.equipments',
            'leases.tenants.documents',
            'leases.guarantors',
            'leases.guarantors.documents',
            'leases.documents',
        ]);

        // On expose explicitement nos attributs calculés uniquement pour cette vue
        $property->leases->each(function ($lease) {
            $lease->append(['missing_pdf_data', 'has_signed_lease']);
        });

        return inertia('Properties/Show', [
            'property' => $property
        ]);
    }

    public function edit(Property $property)
    {
        return Inertia::render('Properties/Edit', [
            'property' => $property
        ]);
    }

    public function update(Request $request, Property $property)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', 'string', Rule::in(['studio', 'apartment', 'commercial', 'garage', 'other'])],
            'floor' => 'required|integer',
            'surface_area' => 'nullable|numeric|min:0',
            'tantiemes_water' => 'nullable|integer|min:0',
            'tantiemes_commons' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $property->update($validated);

        return redirect()->route('properties.show', $property)->with('success', 'Les informations du bien ont été mises à jour.');
    }

    public function destroy(Property $property)
    {
        // On respecte la règle du soft delete 
        $property->delete();

        return redirect()->route('properties.index')->with('success', 'Le bien a été archivé.');
    }
}
