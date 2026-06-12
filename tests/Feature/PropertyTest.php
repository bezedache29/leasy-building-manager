<?php

use App\Models\Property as LeasyProperty;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\post;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\put;
use function Pest\Laravel\delete;
use function Pest\Laravel\assertSoftDeleted;

// Fonction exécutée avant chaque test pour préparer l'environnement
// Leasy étant à usage personnel, on simule la connexion du propriétaire
beforeEach(function () {
    $user = User::factory()->create();
    actingAs($user);
});

it('displays the properties index page', function () {
    // Création de 3 biens en base de données
    LeasyProperty::factory()->count(3)->create();

    $response = get('/properties');

    $response->assertStatus(200);
});

it('displays the property creation page', function () {
    $response = get('/properties/create');

    $response->assertStatus(200);
});

it('stores a new property successfully', function () {
    // Préparation des données valides pour la création
    $propertyData = [
        'name' => 'Test Apartment',
        'type' => 'apartment',
        'floor' => 1,
        'surface_area' => 50.5,
        'tantiemes_water' => 1500,
        'tantiemes_commons' => 200,
        'description' => 'Un bel appartement',
        'notes' => 'Note interne',
    ];

    $response = post('/properties', $propertyData);

    // Vérification de la redirection après succès
    $response->assertRedirect(route('properties.index'));

    // Vérification que le bien a bien été inséré en base de données
    assertDatabaseHas('properties', [
        'name' => 'Test Apartment',
        'floor' => 1,
    ]);
});

it('fails to store a property without a floor', function () {
    // Préparation de données invalides (il manque le champ 'floor')
    $propertyData = [
        'name' => 'Invalid Apartment',
        'type' => 'apartment',
    ];

    $response = post('/properties', $propertyData);

    // Vérification que le validateur Laravel a bien rejeté la requête pour l'étage
    $response->assertSessionHasErrors('floor');
});

it('displays the property details page', function () {
    $property = LeasyProperty::factory()->create();

    $response = get("/properties/{$property->id}");

    $response->assertStatus(200);
});

it('displays the property edit page', function () {
    $property = LeasyProperty::factory()->create();

    $response = get("/properties/{$property->id}/edit");

    $response->assertStatus(200);
});

it('updates an existing property', function () {
    // Création d'un bien avec des données initiales
    $property = LeasyProperty::factory()->create([
        'name' => 'Old Name',
        'floor' => 0,
    ]);

    // Tentative de mise à jour avec de nouvelles données
    $response = put("/properties/{$property->id}", [
        'name' => 'New Name',
        'type' => 'commercial',
        'floor' => 0,
        'surface_area' => 60,
    ]);

    $response->assertRedirect(route('properties.show', $property->id));

    // Vérification de l'enregistrement de la modification en base
    assertDatabaseHas('properties', [
        'id' => $property->id,
        'name' => 'New Name',
        'type' => 'commercial',
    ]);
});

it('soft deletes a property', function () {
    $property = LeasyProperty::factory()->create();

    $response = delete("/properties/{$property->id}");

    $response->assertRedirect(route('properties.index'));

    // Vérification stricte que le bien a été archivé (Soft Delete) et non effacé physiquement [cite: 2026-03-06]
    assertSoftDeleted('properties', [
        'id' => $property->id,
    ]);
});
