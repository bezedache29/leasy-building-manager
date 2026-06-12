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
        'has_residential' => true,
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

it('considers a tenant profile complete without bank details or lease documents', function () {
    // 1. Création d'un locataire avec tous ses champs de profil remplis
    $tenant = Tenant::create([
        'first_name' => 'Claire',
        'last_name' => 'Dubois',
        'email' => 'claire.dubois@example.com',
        'phone' => '0612345678',
        'birth_date' => '1995-08-22',
        'birth_place' => 'Lyon',
        'nationality' => 'French',
        'marital_status' => 'Single',
        'profession' => 'Teacher',
        'current_address' => '12 rue des écoles, 69000 Lyon',
    ]);

    // 2. Ajout des 5 documents strictement obligatoires
    $requiredDocs = [
        'id_card',
        'proof_of_address',
        'employment_contract',
        'payslip',
        'tax_notice'
    ];

    foreach ($requiredDocs as $docCategory) {
        $tenant->documents()->create([
            'name' => "document_{$docCategory}.pdf",
            'file_path' => "path/to/{$docCategory}.pdf",
            'category' => $docCategory,
            'mime_type' => 'application/pdf',
            'size' => 1024,
        ]);
    }

    // 3. Ajout d'un garant Visale avec son document (requis pour qu'un dossier soit complet)
    $guarantor = \App\Models\Guarantor::create([
        'type'       => 'visale',
        'first_name' => 'Action Logement',
        'last_name'  => 'Visale',
    ]);
    $guarantor->documents()->create([
        'name'      => 'garantie_visale.pdf',
        'file_path' => 'path/to/visale.pdf',
        'category'  => 'visale_guarantee',
        'mime_type' => 'application/pdf',
        'size'      => 1024,
    ]);
    $tenant->guarantors()->attach($guarantor->id);

    // 4. On recharge toutes les relations nécessaires
    $tenant->load(['documents', 'guarantors.documents']);

    // 5. Vérification : Le profil est complet
    expect($tenant->is_complete)->toBeTrue();

    // 6. Vérification de la structure vide dictée par Coderabbit
    expect($tenant->missing_items)->toBeArray();
    expect($tenant->missing_items['tenant']['fields'])->toBeEmpty();
    expect($tenant->missing_items['tenant']['documents'])->toBeEmpty();
    expect($tenant->missing_items['guarantors'])->toBeEmpty();
    expect($tenant->missing_items['leases'])->toBeEmpty();
});
