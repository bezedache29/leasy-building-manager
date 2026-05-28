<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Guarantor extends Model
{
    use SoftDeletes;
    use HasFactory;

    protected $fillable = [
        'type',
        'visale_contract_number',
        'first_name',
        'marital_status',
        'last_name',
        'email',
        'phone',
        'current_address',
        'birth_date',
        'birth_place',
        'nationality',
        'profession',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    public function tenants()
    {
        return $this->belongsToMany(Tenant::class)
            ->withPivot('relationship')
            ->withTimestamps();
    }

    public function leases()
    {
        return $this->belongsToMany(Lease::class)->withTimestamps();
    }
}
