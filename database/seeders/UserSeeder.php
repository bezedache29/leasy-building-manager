<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\App;
use Exception;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $password = env('ADMIN_PASSWORD');

        if (!App::environment('local') && empty($password)) {
            throw new Exception("Arrêt critique : ADMIN_PASSWORD est absent du fichier .env. Il est interdit d'utiliser un mot de passe par défaut en production.");
        }

        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@leasy.test')],
            [
                'name' => env('ADMIN_NAME', 'Admin Leasy'),
                'password' => !empty($password) ? $password : 'password',
            ]
        );
    }
}
