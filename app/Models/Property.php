<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'type',
        'floor',
        'surface_area',
        'tantiemes_water',
        'tantiemes_commons',
        'description',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'surface_area' => 'decimal:2',
        'tantiemes_water' => 'integer',
        'tantiemes_commons' => 'integer',
        'floor' => 'integer',
    ];

    // Plus tard, nous ajouterons ici les relations :
    // public function leases() { return $this->hasMany(Lease::class); }
    // public function currentTenant() { ... }
}
