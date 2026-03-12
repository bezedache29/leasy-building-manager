<?php

namespace Database\Factories;

use App\Models\Lease;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lease>
 */
class LeaseFactory extends Factory
{
    protected $model = Lease::class;

    public function definition(): array
    {
        return [
            'property_id' => Property::factory(),
            'start_date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'end_date' => null,
            'rent_amount' => fake()->randomFloat(2, 400, 1500),
            'charges_amount' => fake()->randomFloat(2, 20, 150),
            'deposit_amount' => fake()->randomFloat(2, 400, 1500),
            'payment_day' => fake()->numberBetween(1, 10),
            'status' => 'active',
        ];
    }
}
