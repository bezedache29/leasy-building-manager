<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Equipment;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
    // Ajout d'un équipement dans une pièce spécifique
    public function store(Request $request, Room $room)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $room->equipments()->create($validated);

        return back();
    }

    // Mise à jour d'un équipement existant
    public function update(Request $request, Equipment $equipment)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $equipment->update($validated);

        return back();
    }

    // Suppression (Soft Delete) de l'équipement
    public function destroy(Equipment $equipment)
    {
        $equipment->delete();

        return back();
    }
}
