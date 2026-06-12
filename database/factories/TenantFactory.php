<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class TenantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'current_address' => fake()->address(),
            'birth_date' => fake()->date(),
            'birth_place' => fake()->city(),
            'nationality' => 'French',
            'profession' => fake()->jobTitle(),
            'marital_status' => fake()->randomElement(['single', 'married', 'pacs']),
        ];
    }
}
