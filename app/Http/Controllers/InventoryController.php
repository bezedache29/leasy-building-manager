<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Document;

class InventoryController extends Controller
{
    public function show(Property $property)
    {
        $roomId = request('room');

        // On récupère toutes les photos liées aux équipements de cette pièce précise.
        $photos = Document::where('category', 'like', 'inventory_photo_%')
            ->whereHas('equipment', function ($query) use ($roomId, $property) {
                $query->where('room_id', $roomId)
                    ->where('property_id', $property->id);
            })
            ->latest()
            ->get();

        // Si tu as besoin de savoir de quel bail provient chaque photo dans la vue, 
        // tu peux charger la relation 'documentable' si tes documents sont polymorphiques.

        return view('inventory.show', compact('property', 'photos', 'roomId'));
    }
}
