<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'current_address',
        'birth_date',
        'birth_place',
        'profession',
        'notes'
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    // Un locataire peut avoir plusieurs garants
    public function guarantors(): HasMany
    {
        return $this->hasMany(Guarantor::class);
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
