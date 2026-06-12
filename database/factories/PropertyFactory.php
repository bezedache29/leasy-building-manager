<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Property>
 */
class PropertyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Génération de données fictives pour nos tests de biens
        return [
            'name' => fake()->word() . ' Apartment',
            'type' => fake()->randomElement(['apartment', 'studio', 'commercial', 'garage', 'other']),
            'floor' => fake()->numberBetween(0, 3),
            'surface_area' => fake()->randomFloat(2, 15, 120),
            'tantiemes_water' => fake()->numberBetween(500, 3000),
            'tantiemes_commons' => fake()->numberBetween(100, 500),
            'description' => fake()->sentence(),
            'notes' => fake()->sentence(),
        ];
    }
}
