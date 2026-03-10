<?php

use App\Models\User;
use function Pest\Laravel\{actingAs, get};

it('redirige les visiteurs non connectés vers le login', function () {
    // On tente d'accéder directement à une page sécurisée (le dashboard)
    $response = get('/dashboard');

    // Le middleware 'auth' doit nous bloquer et nous renvoyer vers la page de connexion
    $response->assertRedirect('/login');
});

it('affiche le dashboard pour un utilisateur connecté', function () {
    // 1. On crée un utilisateur factice
    $user = User::factory()->create();

    // 2. On se connecte et on accède au dashboard
    $response = actingAs($user)->get('/dashboard');

    // 3. La page doit s'afficher correctement (200)
    $response->assertStatus(200);
});
