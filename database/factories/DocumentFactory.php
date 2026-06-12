<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class DocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->word() . '.pdf',
            'file_path' => 'documents/test_file.pdf',
            'category' => 'id_card',
            'mime_type' => 'application/pdf',
            // Default polymorphic setup
            'documentable_id' => Tenant::factory(),
            'documentable_type' => Tenant::class,
        ];
    }
}
