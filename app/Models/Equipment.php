<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Equipment extends Model
{
    use HasFactory, SoftDeletes;

    // On force le nom de la table pour contrer la règle d'indénombrabilité anglaise de Laravel
    protected $table = 'equipments';

    protected $fillable = [
        'room_id',
        'name',
        'type',
        'quantity',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    // Un équipement appartient à une pièce
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}
