<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    // Ajout d'une pièce liée à un bien spécifique
    public function store(Request $request, Property $property)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'surface_area' => 'nullable|numeric|min:0',
        ]);

        $property->rooms()->create($validated);

        return back();
    }

    // Mise à jour des informations de la pièce [cite: 2026-03-10]
    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'surface_area' => 'nullable|numeric|min:0',
        ]);

        $room->update($validated);

        return back();
    }

    // Suppression (Soft Delete) de la pièce
    public function destroy(Room $room)
    {
        $room->delete();

        return back();
    }
}
