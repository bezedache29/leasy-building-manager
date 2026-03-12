<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'property_id',
        'name',
        'surface_area',
    ];

    protected $casts = [
        'surface_area' => 'decimal:2',
    ];

    // Une pièce appartient à un bien
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    // Une pièce possède plusieurs équipements
    public function equipments(): HasMany
    {
        return $this->hasMany(Equipment::class);
    }
}
