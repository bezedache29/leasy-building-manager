<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Guarantor extends Model
{
    use SoftDeletes;
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'current_address',
        'birth_date',
        'birth_place',
        'profession',
        'id_document_paths',
        'payslip_paths'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'id_document_paths' => 'array',
        'payslip_paths' => 'array',
    ];

    // Un garant appartient à un locataire
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }
}
