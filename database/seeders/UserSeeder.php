<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Création de ton compte administrateur unique
        $adminPassword = env('ADMIN_PASSWORD');

        if (! $adminPassword) {
            if (! app()->isLocal()) {
                throw new RuntimeException(
                    'ADMIN_PASSWORD is not set. Seeding aborted for non-local environments.'
                );
            }

            // Fallback uniquement en local/développement
            $adminPassword = 'password';
        }

        User::updateOrCreate(
            [
                'email' => env('ADMIN_EMAIL', 'admin@leasy.test'),
            ],
            [
                'name'     => env('ADMIN_NAME', 'Admin Leasy'),
                // Haché automatiquement par le cast 'hashed' du modèle User
                'password' => $adminPassword,
            ]
        );
    }
}
