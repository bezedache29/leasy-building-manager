<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Document;

class InventoryController extends Controller
{
    public function show(Property $property)
    {
        $roomId = request()->validate([
            'room' => 'required|integer|exists:rooms,id',
        ])['room'];

        // On charge la pièce avec ses équipements pour la nouvelle vue
        $room = $property->rooms()->with('equipments')->findOrFail($roomId);

        // On récupère toutes les photos liées à la pièce (générales) 
        // OU liées aux équipements de cette pièce, en filtrant strictement sur la catégorie.
        $photos = Document::where(function ($query) use ($roomId) {
            $query->where('room_id', $roomId)
                ->orWhereHas('equipment', function ($q) use ($roomId) {
                    $q->where('room_id', $roomId);
                });
        })
            ->where('category', 'inventory_photo')
            ->latest()
            ->get();

        $equipments = $room->equipments;

        return view('inventory.show', compact('property', 'photos', 'room', 'roomId', 'equipments'));
    }
}
