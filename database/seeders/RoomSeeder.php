<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        // On recupere tous les biens immobiliers
        $properties = Property::all();

        if ($properties->isEmpty()) {
            $this->command->info('Aucun bien trouve. Veuillez d\'abord seeder les properties.');
            return;
        }

        // Liste des pieces standards a creer pour chaque bien
        $standardRooms = [
            ['name' => 'Salon', 'surface_area' => 20.5],
            ['name' => 'Cuisine', 'surface_area' => 10.0],
            ['name' => 'Chambre principale', 'surface_area' => 12.0],
            ['name' => 'Salle de bain', 'surface_area' => 6.5],
            ['name' => 'Toilettes', 'surface_area' => 2.0],
        ];

        foreach ($properties as $property) {
            foreach ($standardRooms as $roomData) {
                Room::firstOrCreate(
                    ['property_id' => $property->id, 'name' => $roomData['name']],
                    ['surface_area' => $roomData['surface_area']]
                );
            }
        }

        $this->command->info('Les pieces ont ete generees avec succes pour tous les biens !');
    }
}
