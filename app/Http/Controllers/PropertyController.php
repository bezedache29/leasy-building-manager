<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class PropertyController extends Controller
{
    public function index()
    {
        // On charge uniquement les baux actifs avec leurs documents pour calculer le statut du bien
        $properties = Property::with([
            'leases' => fn($q) => $q->where('status', 'active')->with('documents'),
        ])->orderBy('name')->get();

        // Calcul des attributs de signature sur chaque bail actif
        $properties->each(function ($property) {
            $property->leases->each(fn($lease) => $lease->append(['has_signed_lease', 'has_signed_inventory']));
        });

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
        // Chargement des pièces, équipements et photos EDL du bien
        $property->load(['rooms.equipments', 'documents' => fn($q) => $q->where('category', 'inventory_photo')]);

        // Chargement du bail actif avec toutes ses relations
        $activeLeases = $property->leases()
            ->where('status', 'active')
            ->with([
                'tenants',
                'guarantors',
                'documents',
                'annualSettlements' => fn($q) => $q->latest()->with('campaign'),
            ])
            ->get();

        // Chargement des baux terminés pour l'historique d'occupation
        $terminatedLeases = $property->leases()
            ->where('status', 'terminated')
            ->with('tenants')
            ->orderByDesc('end_date')
            ->get();

        // Fusion des deux collections pour le frontend (actifs en premier)
        $property->setRelation('leases', $activeLeases->merge($terminatedLeases));

        $activeLease = $activeLeases->first();

        // Attachement des attributs calculés uniquement sur le bail actif
        if ($activeLease) {
            $activeLease->append(['missing_pdf_data', 'has_signed_lease', 'has_signed_inventory']);
        }

        $currentSettlement = $activeLease?->annualSettlements?->first();

        $waterChargeDetails = null;

        if ($currentSettlement && $currentSettlement->campaign) {
            $rates = $currentSettlement->campaign->water_rates_history;

            // Ensure all required rate keys exist
            $requiredKeys = [
                'distrib_shared_2',
                'distrib_inf_2',
                'distrib_inf_3',
                'distrib_sup_1',
                'distrib_sup_3',
                'distrib_sub_suez',
                'distrib_sub_iroise',
                'wastewater_shared_2',
                'wastewater_inf_2',
                'wastewater_inf_3',
                'wastewater_sup_1',
                'wastewater_sup_3',
                'wastewater_sub_suez',
                'wastewater_sub_iroise',
                'modernization_fee',
                'water_agency_fee'
            ];

            if (!$rates || array_diff($requiredKeys, array_keys($rates))) {
                // Skip water charge calculation if rates are incomplete
                $waterChargeDetails = null;
            } else {
                $consumption = $currentSettlement->water_consumption;

                // --- Calculs HT Ventiles ---
                $distribInfSum = $rates['distrib_shared_2'] + $rates['distrib_inf_2'] + $rates['distrib_inf_3'];
                $distribSupSum = $rates['distrib_sup_1'] + $rates['distrib_shared_2'] + $rates['distrib_sup_3'];
                $distribHT = ((($distribInfSum / 2) / 2) + (($distribSupSum / 2) / 2)) * $consumption
                    + ($rates['distrib_sub_suez'] + $rates['distrib_sub_iroise']) / 5;

                $wasteInfSum = $rates['wastewater_shared_2'] + $rates['wastewater_inf_2'] + $rates['wastewater_inf_3'];
                $wasteSupSum = $rates['wastewater_sup_1'] + $rates['wastewater_shared_2'] + $rates['wastewater_sup_3'];
                $wastewaterHT = ((($wasteInfSum / 2) / 2) + (($wasteSupSum / 2) / 2)) * $consumption
                    + ($rates['wastewater_sub_suez'] + $rates['wastewater_sub_iroise']) / 5;

                $modernizationHT = $rates['modernization_fee'] * $consumption;
                $agencyHT = $rates['water_agency_fee'] * $consumption;
                $organismesHT = $modernizationHT + $agencyHT; // On fusionne le HT des organismes

                // --- Application de la TVA et sous-totaux TTC ---
                $distribTTC = $distribHT * 1.055;      // TVA 5.5%
                $wastewaterTTC = $wastewaterHT * 1.10; // TVA 10%
                $organismesTTC = $organismesHT * 1.10; // TVA 10% sur tout pour coller au tableur

                $totalTVA = ($distribHT * 0.055) + ($wastewaterHT * 0.10) + ($organismesHT * 0.10);
                $totalHT = $distribHT + $wastewaterHT + $organismesHT;
                $totalTTC = $totalHT + $totalTVA;

                $waterChargeDetails = [
                    'settlement_id' => $currentSettlement->id,
                    'year' => $currentSettlement->campaign->year,
                    'consumption' => $consumption,
                    'total_ht' => round($totalHT, 2),
                    'total_tva' => round($totalTVA, 2),
                    'total_ttc' => round($totalTTC, 2),
                    'distrib_ttc' => round($distribTTC, 2),
                    'wastewater_ttc' => round($wastewaterTTC, 2),
                    'organismes_ttc' => round($organismesTTC, 2),
                    'override_ttc' => $currentSettlement->water_override,
                ];
            }
        }

        // Locataires disponibles pour les candidatures (uniquement si le bien est vacant)
        $tenants = $activeLease
            ? collect()
            : Tenant::with('guarantors')->orderBy('last_name')->orderBy('first_name')->get();

        return inertia('Properties/Show', [
            'property' => $property,
            'waterChargeDetails' => $waterChargeDetails,
            'tenants' => $tenants,
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
