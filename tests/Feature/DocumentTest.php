<?php

use App\Models\Document;
use App\Models\Tenant;
use App\Models\Guarantor;
use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\delete;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertSoftDeleted;

/**
 * Vérifie qu'un utilisateur authentifié peut supprimer (soft delete) le document d'un locataire.
 */
test('authenticated user can soft delete a tenant document', function () {
    // Préparation : Création de l'utilisateur, du locataire et du document
    $user = User::factory()->create();
    $tenant = Tenant::factory()->create();

    $document = Document::factory()->create([
        'documentable_id' => $tenant->id,
        'documentable_type' => Tenant::class,
    ]);

    // Action : Requête de suppression
    $response = actingAs($user)->delete(route('documents.destroy', $document));

    // Vérification : Le document est marqué comme supprimé (deleted_at) mais reste en base
    $response->assertStatus(302);
    assertSoftDeleted('documents', [
        'id' => $document->id,
    ]);
});

/**
 * Vérifie qu'un utilisateur authentifié peut supprimer (soft delete) le document d'un garant.
 */
test('authenticated user can soft delete a guarantor document', function () {
    // Préparation : Création de l'utilisateur, du garant et du document
    $user = User::factory()->create();
    $guarantor = Guarantor::factory()->create();

    $document = Document::factory()->create([
        'documentable_id' => $guarantor->id,
        'documentable_type' => Guarantor::class,
    ]);

    // Action : Requête de suppression
    $response = actingAs($user)->delete(route('documents.destroy', $document));

    // Vérification : Soft delete validé
    $response->assertStatus(302);
    assertSoftDeleted('documents', [
        'id' => $document->id,
    ]);
});

/**
 * S'assure que la suppression est bloquée pour les invités.
 */
test('unauthenticated user cannot delete a document', function () {
    // Préparation : Création d'un document
    $document = Document::factory()->create();

    // Action : Tentative de suppression
    $response = delete(route('documents.destroy', $document));

    // Vérification : Redirection vers login et aucune suppression
    $response->assertRedirect('/login');
    assertDatabaseHas('documents', [
        'id' => $document->id,
        'deleted_at' => null,
    ]);
});
