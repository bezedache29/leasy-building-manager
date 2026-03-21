<?php

use App\Models\Guarantor;
use App\Models\Lease;
use App\Models\Property as LeasyProperty;
use App\Models\Tenant;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\post;
use function Pest\Laravel\patch;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

// Authentification simulée avant chaque test
beforeEach(function () {
    $user = User::factory()->create();
    actingAs($user);
});

// --- TESTS DES BAUX (LEASES) ---

it('stores a new lease successfully with a guarantor', function () {
    // Création des données de base nécessaires
    $property = LeasyProperty::factory()->create();
    $tenant = Tenant::factory()->create();
    $guarantor = Guarantor::factory()->create();

    // Simulation des données soumises par le formulaire
    $leaseData = [
        'property_id' => $property->id,
        'tenant_ids' => [$tenant->id],
        'guarantor_ids' => [$guarantor->id],
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

    // Récupération du bail fraîchement créé
    $lease = Lease::where('property_id', $property->id)->first();

    // Vérification de la relation pivot pour le locataire
    assertDatabaseHas('lease_tenant', [
        'lease_id' => $lease->id,
        'tenant_id' => $tenant->id,
        'is_main_tenant' => 1,
    ]);

    // Vérification de la relation pivot pour le garant
    assertDatabaseHas('guarantor_lease', [
        'lease_id' => $lease->id,
        'guarantor_id' => $guarantor->id,
    ]);
});

it('updates an existing lease and syncs guarantors', function () {
    $user = User::factory()->create();
    $property = LeasyProperty::factory()->create();
    $tenant = Tenant::factory()->create();

    $oldGuarantor = Guarantor::factory()->create();
    $newGuarantor = Guarantor::factory()->create();

    // 1. Création d'un bail initial
    $lease = Lease::create([
        'property_id' => $property->id,
        'start_date' => now()->subMonth()->format('Y-m-d'),
        'rent_amount' => 650.00,
        'charges_amount' => 50.00,
        'payment_day' => 1,
        'status' => 'active',
        'keys_building_count' => 0,
        'keys_mailbox_count' => 0,
        'keys_apartment_count' => 0,
    ]);

    $lease->tenants()->attach($tenant->id, ['is_main_tenant' => true]);
    $lease->guarantors()->attach($oldGuarantor->id);

    // 2. Les nouvelles données à envoyer (on remplace l'ancien garant par le nouveau)
    $updatedData = [
        'property_id' => $property->id,
        'tenant_ids' => [$tenant->id],
        'guarantor_ids' => [$newGuarantor->id],
        'start_date' => now()->format('Y-m-d'),
        'rent_amount' => 850.00,
        'charges_amount' => 60.00,
        'payment_day' => 5,
        'keys_building_count' => 1,
        'keys_mailbox_count' => 1,
        'keys_apartment_count' => 2,
    ];

    // 3. Exécution de la requête
    $response = actingAs($user)->put(route('leases.update', $lease->id), $updatedData);

    // 4. On s'assure qu'aucune erreur n'est retournée par le serveur
    $response->assertSessionHasNoErrors();

    // 5. Vérification que le nouveau garant est bien attaché
    assertDatabaseHas('guarantor_lease', [
        'lease_id' => $lease->id,
        'guarantor_id' => $newGuarantor->id,
    ]);

    // 6. Vérification que l'ancien garant a bien été détaché
    assertDatabaseMissing('guarantor_lease', [
        'lease_id' => $lease->id,
        'guarantor_id' => $oldGuarantor->id,
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
