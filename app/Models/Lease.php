<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Lease extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'property_id',
        'start_date',
        'end_date',
        'rent_amount',
        'charges_amount',
        'deposit_amount',
        'payment_day',
        'status',
        'insurer_name',
        'insurer_address',
        'insurer_phone',
        'keys_building_count',
        'keys_mailbox_count',
        'keys_apartment_count',
        'pdf_downloaded_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'rent_amount' => 'decimal:2',
        'charges_amount' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'payment_day' => 'integer',
        'pdf_downloaded_at' => 'datetime',
    ];

    protected $appends = ['missing_pdf_data', 'has_signed_lease'];

    // Un bail appartient à un bien
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    // Un bail peut avoir plusieurs locataires (colocation, couple)
    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class)
            ->withPivot('is_main_tenant')
            ->withTimestamps();
    }

    /**
     * Verifie si le bail possede toutes les informations requises pour generer le PDF.
     * Retourne un tableau vide si tout est bon, sinon la liste des erreurs.
     */
    public function getMissingPdfDataAttribute(): array
    {
        $missing = [];

        if ($this->tenants->isEmpty()) {
            $missing[] = "Aucun locataire n'est rattaché à ce bail";
        } else {
            foreach ($this->tenants as $tenant) {
                $name = $tenant->first_name . ' ' . $tenant->last_name;

                if (!$tenant->current_address) $missing[] = "Adresse manquante pour le locataire ($name)";
                if (!$tenant->birth_date || !$tenant->birth_place) $missing[] = "Date ou lieu de naissance manquant pour le locataire ($name)";
                if (!$tenant->phone) $missing[] = "Téléphone manquant pour le locataire ($name)";
                if (!$tenant->nationality) $missing[] = "Nationalité manquante pour le locataire ($name)";

                if ($tenant->guarantors->isEmpty()) {
                    $missing[] = "Aucun garant renseigné pour le locataire ($name)";
                } else {
                    foreach ($tenant->guarantors as $guarantor) {
                        $gName = $guarantor->first_name . ' ' . $guarantor->last_name;

                        if (!$guarantor->current_address) $missing[] = "Adresse manquante pour le garant ($gName)";
                        if (!$guarantor->phone) $missing[] = "Téléphone manquant pour le garant ($gName)";

                        $hasActe = $guarantor->documents->contains('category', 'guarantee_deed');

                        if (!$hasActe) {
                            $missing[] = "L'acte de caution solidaire n'est pas uploadé pour le garant ($gName)";
                        }
                    }
                }
            }
        }

        return $missing;
    }

    /**
     * Verifie si le bail signé signes a ete uploade.
     */
    public function getHasSignedLeaseAttribute(): bool
    {
        foreach ($this->tenants as $tenant) {
            if ($tenant->documents && $tenant->documents->contains('category', 'lease')) {
                return true;
            }
        }
        return false;
    }
}
