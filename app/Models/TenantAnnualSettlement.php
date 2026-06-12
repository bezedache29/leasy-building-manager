<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantAnnualSettlement extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'annual_charge_campaign_id',
        'lease_id',
        'water_meter_old',
        'water_meter_new',
        'water_consumption',
        'water_calc',
        'water_override',
        'garbage_calc',
        'garbage_override',
        'electricity_calc',
        'electricity_override',
        'cleaning_calc',
        'cleaning_override',
        'total_provisions',
        'final_balance',
    ];

    // ce decompte appartient a une campagne annuelle
    public function annualChargeCampaign(): BelongsTo
    {
        return $this->belongsTo(AnnualChargeCampaign::class);
    }

    // ce decompte appartient a un bail specifique
    public function lease(): BelongsTo
    {
        return $this->belongsTo(Lease::class);
    }

    /**
     * La campagne de charges annuelles associée à ce décompte.
     */
    public function campaign()
    {
        return $this->belongsTo(AnnualChargeCampaign::class, 'annual_charge_campaign_id');
    }
}
