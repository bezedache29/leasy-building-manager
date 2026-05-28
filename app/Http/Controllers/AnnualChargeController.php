<?php

namespace App\Http\Controllers;

use App\Models\AnnualChargeCampaign;
use App\Models\TenantAnnualSettlement;
use App\Models\Lease;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnnualChargeController extends Controller
{
    public function create(Property $property)
    {
        // on charge le bail actif avec ses locataires pour pouvoir afficher leurs noms sur la page
        $property->load(['leases' => function ($query) {
            $query->where('status', 'active')->with('tenants');
        }]);

        // on renvoie la vue react via inertia avec les donnees du bien
        return inertia('AnnualCharges/Create', [
            'property' => $property,
        ]);
    }

    // public function store(Request $request, Property $property)
    // {
    //     dd($request->all());

    //     $validated = $request->validate([
    //         'year' => 'required|integer',
    //         'distribution_lower' => 'required|numeric',
    //         'distribution_upper' => 'required|numeric',
    //         'wastewater_lower' => 'required|numeric',
    //         'wastewater_upper' => 'required|numeric',
    //         'distribution_subscription' => 'required|numeric',
    //         'wastewater_subscription_suez' => 'required|numeric',
    //         'wastewater_subscription_iroise' => 'required|numeric',
    //         'modernization_fee' => 'required|numeric',
    //         'water_agency_fee' => 'required|numeric',
    //         'water_meter_old' => 'required|numeric',
    //         'water_meter_new' => 'required|numeric',
    //     ]);

    //     try {
    //         DB::beginTransaction();

    //         $campaign = AnnualChargeCampaign::updateOrCreate(
    //             ['year' => $validated['year']],
    //             [
    //                 'water_rates_history' => [
    //                     'distribution_lower' => $validated['distribution_lower'],
    //                     'distribution_upper' => $validated['distribution_upper'],
    //                     'wastewater_lower' => $validated['wastewater_lower'],
    //                     'wastewater_upper' => $validated['wastewater_upper'],
    //                     'distribution_subscription' => $validated['distribution_subscription'],
    //                     'wastewater_subscription_suez' => $validated['wastewater_subscription_suez'],
    //                     'wastewater_subscription_iroise' => $validated['wastewater_subscription_iroise'],
    //                     'modernization_fee' => $validated['modernization_fee'],
    //                     'water_agency_fee' => $validated['water_agency_fee'],
    //                 ]
    //             ]
    //         );


    //         $activeLease = $property->leases()->where('status', 'active')->firstOrFail();


    //         $consumption = $validated['water_meter_new'] - $validated['water_meter_old'];

    //         $calc_distribution = (($validated['distribution_lower'] / 2) / 2 + ($validated['distribution_upper'] / 2) / 2) * $consumption;
    //         $calc_wastewater = (($validated['wastewater_lower'] / 2) / 2 + ($validated['wastewater_upper'] / 2) / 2) * $consumption;

    //         $calc_sub_distribution = $validated['distribution_subscription'] / 5;
    //         $calc_sub_wastewater = ($validated['wastewater_subscription_suez'] + $validated['wastewater_subscription_iroise']) / 5;

    //         $calc_modernization = $validated['modernization_fee'] * $consumption;
    //         $calc_agency = $validated['water_agency_fee'] * $consumption;

    //         $totalWaterCalc = $calc_distribution + $calc_wastewater + $calc_sub_distribution + $calc_sub_wastewater + $calc_modernization + $calc_agency;


    //         $settlement = TenantAnnualSettlement::updateOrCreate(
    //             [
    //                 'annual_charge_campaign_id' => $campaign->id,
    //                 'lease_id' => $activeLease->id,
    //             ],
    //             [
    //                 'water_meter_old' => $validated['water_meter_old'],
    //                 'water_meter_new' => $validated['water_meter_new'],
    //                 'water_consumption' => $consumption,
    //                 'water_calc' => round($totalWaterCalc, 2),

    //             ]
    //         );

    //         DB::commit();


    //         return redirect()->route('properties.show', $property->id);
    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         throw $e;
    //     }
    // }

    public function store(Request $request, Property $property)
    {
        // validation stricte
        $validatedData = $request->validate([
            'year' => 'required|integer',
            'water_meter_old' => 'required|numeric',
            'water_meter_new' => 'required|numeric',
            'distrib_sub_suez' => 'required|numeric',
            'distrib_sub_iroise' => 'required|numeric',
            'distrib_sup_1' => 'required|numeric',
            'distrib_shared_2' => 'required|numeric',
            'distrib_inf_2' => 'required|numeric',
            'distrib_sup_3' => 'required|numeric',
            'distrib_inf_3' => 'required|numeric',
            'wastewater_sub_suez' => 'required|numeric',
            'wastewater_sub_iroise' => 'required|numeric',
            'wastewater_sup_1' => 'required|numeric',
            'wastewater_shared_2' => 'required|numeric',
            'wastewater_inf_2' => 'required|numeric',
            'wastewater_sup_3' => 'required|numeric',
            'wastewater_inf_3' => 'required|numeric',
            'modernization_fee' => 'required|numeric',
            'water_agency_fee' => 'required|numeric',
        ]);

        try {
            DB::beginTransaction();

            // sauvegarde de la campagne
            $annualCampaign = AnnualChargeCampaign::updateOrCreate(
                ['year' => $validatedData['year']],
                ['water_rates_history' => $validatedData]
            );

            // recuperation du bail
            $activeLease = $property->leases()->where('status', 'active')->firstOrFail();
            $waterConsumption = $validatedData['water_meter_new'] - $validatedData['water_meter_old'];

            // --- 1. DISTRIBUTION D'EAU ---
            // on reinjecte la valeur commune (shared_2) dans les deux sommes
            $distribInferiorSum = $validatedData['distrib_shared_2'] + $validatedData['distrib_inf_2'] + $validatedData['distrib_inf_3'];
            $distribSuperiorSum = $validatedData['distrib_sup_1'] + $validatedData['distrib_shared_2'] + $validatedData['distrib_sup_3'];

            $newDistribInferior = ($distribInferiorSum / 2) / 2;
            $newDistribSuperior = ($distribSuperiorSum / 2) / 2;

            $totalDistribConsumption = ($newDistribInferior + $newDistribSuperior) * $waterConsumption;
            $totalDistribSubscription = ($validatedData['distrib_sub_suez'] + $validatedData['distrib_sub_iroise']) / 5;

            // --- 2. EAUX USEES ---
            $wastewaterInferiorSum = $validatedData['wastewater_shared_2'] + $validatedData['wastewater_inf_2'] + $validatedData['wastewater_inf_3'];
            $wastewaterSuperiorSum = $validatedData['wastewater_sup_1'] + $validatedData['wastewater_shared_2'] + $validatedData['wastewater_sup_3'];

            $newWastewaterInferior = ($wastewaterInferiorSum / 2) / 2;
            $newWastewaterSuperior = ($wastewaterSuperiorSum / 2) / 2;

            $totalWastewaterConsumption = ($newWastewaterInferior + $newWastewaterSuperior) * $waterConsumption;
            $totalWastewaterSubscription = ($validatedData['wastewater_sub_suez'] + $validatedData['wastewater_sub_iroise']) / 5;

            // --- 3. ORGANISMES PUBLICS ---
            $totalModernization = $validatedData['modernization_fee'] * $waterConsumption;
            $totalAgency = $validatedData['water_agency_fee'] * $waterConsumption;

            // --- TOTAL ---
            $totalWaterCalculated = $totalDistribConsumption
                + $totalDistribSubscription
                + $totalWastewaterConsumption
                + $totalWastewaterSubscription
                + $totalModernization
                + $totalAgency;

            // enregistrement du decompte
            $tenantSettlement = TenantAnnualSettlement::updateOrCreate(
                [
                    'annual_charge_campaign_id' => $annualCampaign->id,
                    'lease_id' => $activeLease->id,
                ],
                [
                    'water_meter_old' => $validatedData['water_meter_old'],
                    'water_meter_new' => $validatedData['water_meter_new'],
                    'water_consumption' => $waterConsumption,
                    'water_calc' => round($totalWaterCalculated, 2),
                ]
            );

            DB::commit();
            return redirect()->route('properties.annual-charges.review', [
                'property' => $property->id,
                'settlement' => $tenantSettlement->id
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    // Ensuite, ajoute cette NOUVELLE methode juste en dessous de store() :
    public function review(Property $property, TenantAnnualSettlement $settlement)
    {
        $settlement->load('campaign');
        $rates = $settlement->campaign->water_rates_history;
        $consumption = $settlement->water_consumption;

        // On isole les calculs de Distribution
        $distribInfSum = $rates['distrib_shared_2'] + $rates['distrib_inf_2'] + $rates['distrib_inf_3'];
        $distribSupSum = $rates['distrib_sup_1'] + $rates['distrib_shared_2'] + $rates['distrib_sup_3'];
        $distribCoefInf = ($distribInfSum / 2) / 2;
        $distribCoefSup = ($distribSupSum / 2) / 2;
        $distribCoef = $distribCoefInf + $distribCoefSup;

        // On isole les calculs des Eaux Usees
        $wasteInfSum = $rates['wastewater_shared_2'] + $rates['wastewater_inf_2'] + $rates['wastewater_inf_3'];
        $wasteSupSum = $rates['wastewater_sup_1'] + $rates['wastewater_shared_2'] + $rates['wastewater_sup_3'];
        $wasteCoefInf = ($wasteInfSum / 2) / 2;
        $wasteCoefSup = ($wasteSupSum / 2) / 2;
        $wasteCoef = $wasteCoefInf + $wasteCoefSup;

        // On renseigne le tableau avec tous les details
        $reviewData = [
            'consumption' => $consumption,
            'distrib' => [
                'sub_ht' => ($rates['distrib_sub_suez'] + $rates['distrib_sub_iroise']) / 5,
                'coef' => round($distribCoef, 4),
                'cons_ht' => $distribCoef * $consumption,
                'details' => [
                    'inf_formula' => "({$rates['distrib_shared_2']} + {$rates['distrib_inf_2']} + {$rates['distrib_inf_3']})",
                    'sup_formula' => "({$rates['distrib_sup_1']} + {$rates['distrib_shared_2']} + {$rates['distrib_sup_3']})",
                    'inf_res' => round($distribCoefInf, 4),
                    'sup_res' => round($distribCoefSup, 4),
                ]
            ],
            'wastewater' => [
                'sub_ht' => ($rates['wastewater_sub_suez'] + $rates['wastewater_sub_iroise']) / 5,
                'coef' => round($wasteCoef, 4),
                'cons_ht' => $wasteCoef * $consumption,
                'details' => [
                    'inf_formula' => "({$rates['wastewater_shared_2']} + {$rates['wastewater_inf_2']} + {$rates['wastewater_inf_3']})",
                    'sup_formula' => "({$rates['wastewater_sup_1']} + {$rates['wastewater_shared_2']} + {$rates['wastewater_sup_3']})",
                    'inf_res' => round($wasteCoefInf, 4),
                    'sup_res' => round($wasteCoefSup, 4),
                ]
            ],
            'organismes' => [
                'mod_ht' => $rates['modernization_fee'] * $consumption,
                'mod_coef' => $rates['modernization_fee'],
                'agency_ht' => $rates['water_agency_fee'] * $consumption,
                'agency_coef' => $rates['water_agency_fee'],
            ]
        ];

        return inertia('AnnualCharges/Review', [
            'property' => $property,
            'settlement' => $settlement,
            'reviewData' => $reviewData
        ]);
    }
}
