<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnnualChargeCampaign extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'year',
        'water_rates_history',
        'total_water_invoice',
        'total_water_consumption',
        'total_electricity_invoice',
        'total_garbage_invoice',
        'total_cleaning_invoice',
    ];

    // on cast la colonne json en tableau pour l'utiliser facilement en php
    protected $casts = [
        'water_rates_history' => 'array',
    ];

    // une campagne contient plusieurs decomptes de locataires
    public function tenantAnnualSettlements(): HasMany
    {
        return $this->hasMany(TenantAnnualSettlement::class);
    }
}
