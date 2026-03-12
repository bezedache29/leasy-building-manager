<?php

use App\Models\Property as LeasyProperty;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\post;
use function Pest\Laravel\put;
use function Pest\Laravel\delete;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertSoftDeleted;

// Authentification simulée avant chaque test [cite: 2026-03-10]
beforeEach(function () {
    $user = User::factory()->create();
    actingAs($user);
});

// --- TESTS DES PIÈCES (ROOMS) ---

it('stores a new room successfully', function () {
    // Création d'un bien parent via l'alias pour éviter les erreurs Intelephense
    $property = LeasyProperty::factory()->create();

    $roomData = [
        'name' => 'Cuisine',
        'surface_area' => 15.5,
    ];

    $response = post("/properties/{$property->id}/rooms", $roomData);

    $response->assertStatus(302);

    // Vérification de l'insertion en base de données
    assertDatabaseHas('rooms', [
        'property_id' => $property->id,
        'name' => 'Cuisine',
    ]);
});

it('updates an existing room', function () {
    $property = LeasyProperty::factory()->create();

    // Création manuelle d'une pièce (car nous n'avons pas généré de factory pour Room)
    $room = $property->rooms()->create([
        'name' => 'Old Room',
        'surface_area' => 10,
    ]);

    $response = put("/rooms/{$room->id}", [
        'name' => 'New Room',
        'surface_area' => 20,
    ]);

    $response->assertStatus(302);

    assertDatabaseHas('rooms', [
        'id' => $room->id,
        'name' => 'New Room',
        'surface_area' => 20,
    ]);
});

it('soft deletes a room', function () {
    $property = LeasyProperty::factory()->create();
    $room = $property->rooms()->create([
        'name' => 'Chambre',
    ]);

    $response = delete("/rooms/{$room->id}");

    $response->assertStatus(302);

    // Vérification stricte du soft delete
    assertSoftDeleted('rooms', [
        'id' => $room->id,
    ]);
});

// --- TESTS DES ÉQUIPEMENTS (EQUIPMENTS) ---

it('stores a new equipment successfully', function () {
    $property = LeasyProperty::factory()->create();
    $room = $property->rooms()->create([
        'name' => 'Salon',
    ]);

    $equipmentData = [
        'name' => 'Radiateur',
        'type' => 'Chauffage',
        'quantity' => 2,
        'notes' => 'Marque Thermor',
    ];

    $response = post("/rooms/{$room->id}/equipments", $equipmentData);

    $response->assertStatus(302);

    assertDatabaseHas('equipments', [
        'room_id' => $room->id,
        'name' => 'Radiateur',
        'quantity' => 2,
    ]);
});

it('updates an existing equipment', function () {
    $property = LeasyProperty::factory()->create();
    $room = $property->rooms()->create([
        'name' => 'Salle de bain',
    ]);

    $equipment = $room->equipments()->create([
        'name' => 'Ancien lavabo',
        'quantity' => 1,
    ]);

    $response = put("/equipments/{$equipment->id}", [
        'name' => 'Nouveau lavabo double',
        'type' => 'Plomberie',
        'quantity' => 1,
        'notes' => 'Neuf',
    ]);

    $response->assertStatus(302);

    assertDatabaseHas('equipments', [
        'id' => $equipment->id,
        'name' => 'Nouveau lavabo double',
        'type' => 'Plomberie',
    ]);
});

it('soft deletes an equipment', function () {
    $property = LeasyProperty::factory()->create();
    $room = $property->rooms()->create([
        'name' => 'Cuisine',
    ]);

    $equipment = $room->equipments()->create([
        'name' => 'Four encastrable',
        'quantity' => 1,
    ]);

    $response = delete("/equipments/{$equipment->id}");

    $response->assertStatus(302);

    // Vérification stricte du soft delete
    assertSoftDeleted('equipments', [
        'id' => $equipment->id,
    ]);
});
