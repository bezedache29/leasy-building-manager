<?php

namespace Database\Seeders;

use App\Models\Equipment;
use App\Models\Property;
use App\Models\Room;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class T2RoomSeeder extends Seeder
{
    public function run(): void
    {
        $property = Property::where('name', 'Appartement T2')->first();

        if (! $property) {
            $this->command->error('Propriété "Appartement T2" introuvable. Lancez d\'abord PropertySeeder.');

            return;
        }

        $rooms = [
            [
                'name' => 'Pièce de vie',
                'surface_area' => null,
                'equipments' => [
                    ['name' => 'Prises électriques', 'type' => 'Électricité', 'quantity' => 8, 'notes' => null],
                    ['name' => 'Prises antenne TV', 'type' => 'Électricité', 'quantity' => 2, 'notes' => null],
                    ['name' => 'Prises RJ45', 'type' => 'Réseau', 'quantity' => 2, 'notes' => null],
                    ['name' => 'Radiateur', 'type' => 'Chauffage', 'quantity' => 2, 'notes' => null],
                    ['name' => 'Interphone', 'type' => 'Divers', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Programmateur chauffage', 'type' => 'Chauffage', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Tableau électrique', 'type' => 'Électricité', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Ampoule', 'type' => 'Éclairage', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Détecteur de fumée', 'type' => 'Sécurité', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Fenêtre avec volet roulant', 'type' => 'Menuiserie', 'quantity' => 1, 'notes' => 'Avec interrupteur'],
                    ['name' => 'Colonne électrique', 'type' => 'Électricité', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Sol PVC', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Mur du fond', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => 'Peint gris'],
                    ['name' => 'Mur gauche', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => 'Peint gris'],
                    ['name' => 'Mur côté rue', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => 'Peint gris'],
                    ['name' => 'Plafond', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => null],
                ],
            ],
            [
                'name' => 'Cuisine',
                'surface_area' => null,
                'equipments' => [
                    ['name' => 'Prises électriques', 'type' => 'Électricité', 'quantity' => 8, 'notes' => null],
                    ['name' => 'Bouche VMC', 'type' => 'Ventilation', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Ampoule', 'type' => 'Éclairage', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Lumière évier', 'type' => 'Éclairage', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Baie vitrée', 'type' => 'Menuiserie', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Balcon', 'type' => 'Extérieur', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Réfrigérateur', 'type' => 'Électroménager', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Plaque vitrocéramique', 'type' => 'Électroménager', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Hotte aspirante', 'type' => 'Électroménager', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Plan de travail', 'type' => 'Menuiserie', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Évier', 'type' => 'Plomberie', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Sol PVC', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Mur carrelé', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Plafond', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => null],
                ],
            ],
            [
                'name' => 'Couloir + Entrée',
                'surface_area' => null,
                'equipments' => [
                    ['name' => 'Porte d\'entrée', 'type' => 'Menuiserie', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Fenêtre', 'type' => 'Menuiserie', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Radiateur', 'type' => 'Chauffage', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Prises électriques', 'type' => 'Électricité', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Interrupteurs', 'type' => 'Électricité', 'quantity' => 2, 'notes' => null],
                    ['name' => 'Interrupteur', 'type' => 'Électricité', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Ampoules', 'type' => 'Éclairage', 'quantity' => 2, 'notes' => null],
                    ['name' => 'Sol PVC', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Murs', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Plafond', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => null],
                ],
            ],
            [
                'name' => 'Salle de bain',
                'surface_area' => null,
                'equipments' => [
                    ['name' => 'Cabine de douche', 'type' => 'Plomberie', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Meuble double vasque avec miroir', 'type' => 'Plomberie', 'quantity' => 1, 'notes' => '1 prise intégrée, 3 lumières intégrées'],
                    ['name' => 'Porte-serviette', 'type' => 'Accessoires', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Évacuation lave-linge', 'type' => 'Plomberie', 'quantity' => 1, 'notes' => 'Avec bouchon'],
                    ['name' => 'Robinet eau lave-linge', 'type' => 'Plomberie', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Ballon eau chaude', 'type' => 'Plomberie', 'quantity' => 1, 'notes' => 'Avec compteur d\'eau'],
                    ['name' => 'Placard de rangement', 'type' => 'Menuiserie', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Porte avec clé', 'type' => 'Menuiserie', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Fenêtre avec volet roulant', 'type' => 'Menuiserie', 'quantity' => 1, 'notes' => 'Avec interrupteur'],
                    ['name' => 'Bouche VMC', 'type' => 'Ventilation', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Prises électriques', 'type' => 'Électricité', 'quantity' => 3, 'notes' => null],
                    ['name' => 'Ampoule', 'type' => 'Éclairage', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Sol PVC', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Mur carrelé', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => null],
                ],
            ],
            [
                'name' => 'Chambre',
                'surface_area' => null,
                'equipments' => [
                    ['name' => 'Fenêtre avec volet roulant', 'type' => 'Menuiserie', 'quantity' => 1, 'notes' => 'Avec interrupteur'],
                    ['name' => 'Porte avec clé', 'type' => 'Menuiserie', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Placard', 'type' => 'Menuiserie', 'quantity' => 1, 'notes' => '6 étagères, 1 tiroir, 1 penderie'],
                    ['name' => 'Placard de rangement hauteur', 'type' => 'Menuiserie', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Radiateur', 'type' => 'Chauffage', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Prises électriques', 'type' => 'Électricité', 'quantity' => 5, 'notes' => null],
                    ['name' => 'Interrupteurs', 'type' => 'Électricité', 'quantity' => 2, 'notes' => null],
                    ['name' => 'Ampoule', 'type' => 'Éclairage', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Murs peints beige', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Plafond', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => null],
                ],
            ],
            [
                'name' => 'Toilettes',
                'surface_area' => null,
                'equipments' => [
                    ['name' => 'WC', 'type' => 'Plomberie', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Porte avec clé', 'type' => 'Menuiserie', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Fenêtre', 'type' => 'Menuiserie', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Bouche VMC', 'type' => 'Ventilation', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Prise électrique', 'type' => 'Électricité', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Interrupteur', 'type' => 'Électricité', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Ampoule', 'type' => 'Éclairage', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Sol PVC', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Mur carrelé', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => null],
                    ['name' => 'Plafond', 'type' => 'Revêtement', 'quantity' => 1, 'notes' => null],
                ],
            ],
        ];

        DB::transaction(function () use ($property, $rooms) {
            // Suppression des pièces existantes (et leurs équipements en cascade)
            $property->rooms()->each(function (Room $room) {
                $room->equipments()->delete();
                $room->delete();
            });

            foreach ($rooms as $roomData) {
                $room = Room::create([
                    'property_id' => $property->id,
                    'name' => $roomData['name'],
                    'surface_area' => $roomData['surface_area'],
                ]);

                foreach ($roomData['equipments'] as $eq) {
                    Equipment::create([
                        'room_id' => $room->id,
                        'name' => $eq['name'],
                        'type' => $eq['type'],
                        'quantity' => $eq['quantity'],
                        'notes' => $eq['notes'],
                    ]);
                }
            }
        });

        $this->command->info('Pièces et équipements du T2 générés avec succès !');
    }
}
