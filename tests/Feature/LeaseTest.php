<?php

use App\Models\Lease;
use App\Models\Property as LeasyProperty;
use App\Models\Tenant;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\post;
use function Pest\Laravel\put;
use function Pest\Laravel\patch;
use function Pest\Laravel\assertDatabaseHas;

// Authentification simulée avant chaque test
beforeEach(function () {
    $user = User::factory()->create();
    actingAs($user);
});

// --- TESTS DES BAUX (LEASES) ---

it('stores a new lease successfully', function () {
    // Création des données de base nécessaires
    $property = LeasyProperty::factory()->create();
    $tenant = Tenant::factory()->create();

    // Simulation des données soumises par le formulaire
    $leaseData = [
        'property_id' => $property->id,
        'tenant_ids' => [$tenant->id],
        'start_date' => now()->addDays(5)->format('Y-m-d'),
        'rent_amount' => 800,
        'charges_amount' => 50,
        'payment_day' => 1,
        'keys_building_count' => 1,
        'keys_mailbox_count' => 1,
        'keys_apartment_count' => 2,
    ];

    // Exécution de la requête POST
    $response = post(route('leases.store'), $leaseData);

    // Vérification de la redirection vers la fiche du bien
    $response->assertRedirect(route('properties.show', $property->id));

    // Vérification de la création du bail en base de données
    assertDatabaseHas('leases', [
        'property_id' => $property->id,
        'rent_amount' => 800.00,
        'status' => 'active',
    ]);

    // Vérification de la relation pivot
    assertDatabaseHas('lease_tenant', [
        'tenant_id' => $tenant->id,
        'is_main_tenant' => 1,
    ]);
});

it('updates an existing lease', function () {
    // Création d'un bail existant avec son locataire
    $property = LeasyProperty::factory()->create();
    $tenant = Tenant::factory()->create();
    $lease = Lease::factory()->create([
        'property_id' => $property->id,
        'rent_amount' => 500.00,
    ]);
    $lease->tenants()->attach($tenant->id, ['is_main_tenant' => true]);

    // Nouvelles données à mettre à jour
    $updatedData = [
        'property_id' => $property->id,
        'tenant_ids' => [$tenant->id],
        'start_date' => $lease->start_date->format('Y-m-d'),
        'end_date' => null,
        'rent_amount' => 650.00, // Le loyer augmente
        'charges_amount' => 60.00,
        'deposit_amount' => 500.00,
        'payment_day' => 5,
        'keys_building_count' => 1,
        'keys_mailbox_count' => 1,
        'keys_apartment_count' => 2,
    ];

    // Exécution de la requête PUT
    $response = put(route('leases.update', $lease->id), $updatedData);

    // Vérification de la redirection
    $response->assertRedirect(route('properties.show', $property->id));

    // Vérification que la modification est bien enregistrée
    assertDatabaseHas('leases', [
        'id' => $lease->id,
        'rent_amount' => 850.00,
    ]);
});

it('terminates an active lease', function () {
    // Creation d'un bail actif dans le passe
    $lease = Lease::factory()->create([
        'start_date' => '2025-01-01',
        'end_date' => null,
        'status' => 'active',
    ]);

    // Une date de fin dans le passe pour forcer le statut 'terminated'
    $terminationDate = '2025-12-31';

    // Execution de la requete PATCH pour la cloture
    $response = patch(route('leases.terminate', $lease->id), [
        'end_date' => $terminationDate,
    ]);

    // Verification que le message de succes est present en session
    $response->assertSessionHas('success');

    // Verification du changement de statut et de l'ajout de la date de fin
    assertDatabaseHas('leases', [
        'id' => $lease->id,
        'end_date' => $terminationDate,
        'status' => 'terminated',
    ]);
});

it('fails termination if end date is before start date', function () {
    $lease = Lease::factory()->create([
        'start_date' => '2026-06-01',
        'status' => 'active',
    ]);

    // Tentative de clôture avec une date incohérente (avant le début)
    $response = patch(route('leases.terminate', $lease->id), [
        'end_date' => '2026-01-01',
    ]);

    // Vérification que la validation échoue sur le champ end_date
    $response->assertSessionHasErrors('end_date');

    // Vérification que le statut n'a pas changé en base
    assertDatabaseHas('leases', [
        'id' => $lease->id,
        'status' => 'active',
    ]);
});
