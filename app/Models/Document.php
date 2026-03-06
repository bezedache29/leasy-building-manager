<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'file_path',
        'category',
        'mime_type',
    ];

    // Permet de retrouver à qui appartient le document (Locataire, Garant, Bail...)
    public function documentable(): MorphTo
    {
        return $this->morphTo();
    }
}
