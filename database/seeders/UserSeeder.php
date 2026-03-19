<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Creation de ton compte administrateur unique
        User::updateOrCreate(
            [
                'name' => env('ADMIN_NAME', 'Admin Leasy'),
                'email' => env('ADMIN_EMAIL', 'admin@leasy.test'),
                'password' => Hash::make(env('ADMIN_PASSWORD', 'password')),
            ]
        );
    }
}
