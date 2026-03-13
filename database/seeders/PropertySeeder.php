<?php

namespace Database\Seeders;

use App\Models\Property;
use Illuminate\Database\Seeder;

class PropertySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $properties = [
            [
                'name' => 'Studio',
                'type' => 'studio',
                'floor' => 1,
                'surface_area' => 23.56,
                'tantiemes_water' => 866,
                'tantiemes_commons' => 157,
                'description' => 'Appartement de type Studio',
            ],
            [
                'name' => 'Appartement T2',
                'type' => 'apartment',
                'floor' => 1,
                'surface_area' => 51.63,
                'tantiemes_water' => 1898,
                'tantiemes_commons' => 344,
                'description' => 'Appartement de type T2',
            ],
            [
                'name' => 'Appartement T3',
                'type' => 'apartment',
                'floor' => 2,
                'surface_area' => 74.69,
                'tantiemes_water' => 2746,
                'tantiemes_commons' => 499,
                'description' => 'Appartement de type T3',
            ],
            [
                'name' => 'Petit Local',
                'type' => 'commercial',
                'floor' => 0,
                'surface_area' => 62.61,
                'tantiemes_water' => 2302,
                'tantiemes_commons' => 0,
                'description' => 'Petit local commercial (RDC)',
            ],
            [
                'name' => 'Grand Local',
                'type' => 'commercial',
                'floor' => 0,
                'surface_area' => 59.50,
                'tantiemes_water' => 2188,
                'tantiemes_commons' => 0,
                'description' => 'Grand local commercial (RDC)',
            ],
        ];

        foreach ($properties as $property) {
            Property::firstOrCreate(
                ['name' => $property['name']],
                $property
            );
        }
    }
}
