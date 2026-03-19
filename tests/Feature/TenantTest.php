<?php

use App\Models\User;
use App\Models\Tenant;
use function Pest\Laravel\{actingAs, post};

it('can create a tenant with nationality and birth date', function () {
    // 1. Préparer l'environnement : créer et authentifier un utilisateur
    $user = User::factory()->create();

    // 2. Simuler les données envoyées par le formulaire React
    $tenantData = [
        'first_name' => 'Jean',
        'last_name' => 'Dupont',
        'email' => 'jean.dupont@example.com',
        'phone' => '0601020304',
        'birth_date' => '1990-05-15',
        'birth_place' => 'Paris',
        'nationality' => 'French',
        'marital_status' => 'Single',
        'profession' => 'Engineer',
        'current_address' => '10 rue de la Paix, 75000 Paris',
    ];

    // 3. Envoyer la requête POST à la route de création de locataire
    $response = actingAs($user)->post('/tenants', $tenantData);

    // 4. S'assurer qu'il n'y a aucune erreur de validation et que l'application redirige (Code 302)
    $response->assertStatus(302);
    $response->assertSessionHasNoErrors();

    // 5. Vérification en base de données : s'assurer que le locataire a été créé avec les bonnes données
    $tenant = Tenant::where('email', 'jean.dupont@example.com')->first();

    expect($tenant)->not->toBeNull();
    expect($tenant->nationality)->toBe('French');
    expect($tenant->birth_place)->toBe('Paris');
});

it('identifies a new tenant dossier as incomplete', function () {
    // 1. Créer un locataire basique directement en base de données
    $tenant = Tenant::create([
        'first_name' => 'Alice',
        'last_name' => 'Martin',
        'email' => 'alice@example.com',
        'phone' => '0600000000',
    ]);

    // 2. Vérifier la logique du modèle (getIsCompleteAttribute)
    // Un nouveau locataire n'a pas de documents, il DOIT donc être incomplet
    expect($tenant->is_complete)->toBeFalse();

    // 3. Vérifier que le système a bien généré une liste d'éléments manquants
    expect($tenant->missing_items)->not->toBeEmpty();

    // 4. Vérifier que les champs et documents spécifiques manquants sont correctement identifiés
    expect($tenant->missing_items['tenant']['documents'])->toContain("Pièce d'identité");
    expect($tenant->missing_items['tenant']['fields'])->toContain('Nationalité');
});
