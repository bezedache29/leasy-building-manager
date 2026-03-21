<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\Equipment;
use Illuminate\Database\Seeder;

class EquipmentSeeder extends Seeder
{
    public function run(): void
    {
        // On récupère toutes les pièces qu'on vient de créer
        $rooms = Room::all();

        if ($rooms->isEmpty()) {
            $this->command->info('Aucune pièce trouvée. Veuillez d\'abord lancer le RoomSeeder.');
            return;
        }

        $equipments = [
            ['name' => 'Réfrigérateur', 'type' => 'Électroménager', 'quantity' => 1, 'notes' => 'Bon état, marque Samsung'],
            ['name' => 'Four encastrable', 'type' => 'Électroménager', 'quantity' => 1, 'notes' => 'Neuf'],
            ['name' => 'Prise murale', 'type' => 'Électricité', 'quantity' => 4, 'notes' => 'RAS'],
            ['name' => 'Radiateur électrique', 'type' => 'Chauffage', 'quantity' => 1, 'notes' => 'Thermostat fonctionnel'],
            ['name' => 'Interrupteur', 'type' => 'Électricité', 'quantity' => 2, 'notes' => 'RAS'],
            ['name' => 'Fenêtre double vitrage', 'type' => 'Menuiserie', 'quantity' => 1, 'notes' => 'Bon état'],
            ['name' => 'Détecteur de fumée', 'type' => 'Sécurité', 'quantity' => 1, 'notes' => 'Pile neuve'],
            ['name' => 'Robinet mitigeur', 'type' => 'Plomberie', 'quantity' => 1, 'notes' => 'Léger calcaire mais fonctionnel'],
        ];

        foreach ($rooms as $room) {
            // On ajoute 2 à 4 équipements au hasard par pièce
            $randomEquipments = collect($equipments)->random(rand(2, 4));

            foreach ($randomEquipments as $eqData) {
                Equipment::create([
                    'room_id' => $room->id,
                    'name' => $eqData['name'],
                    'type' => $eqData['type'],
                    'quantity' => $eqData['quantity'],
                    'notes' => $eqData['notes'],
                ]);
            }
        }

        $this->command->info('Les équipements ont été générés avec succès dans les pièces !');
    }
}
