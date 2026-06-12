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
        'lease_type',
        'activity_description',
        'base_index_label',
        'base_index_value',
        'insurer_name',
        'insurer_address',
        'insurer_phone',
        'keys_building_count',
        'keys_mailbox_count',
        'keys_apartment_count',
        'keys_grid_count',
        'pdf_downloaded_at',
        'lease_downloaded_at',
        'inventory_downloaded_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'rent_amount' => 'decimal:2',
        'charges_amount' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'payment_day' => 'integer',
        'lease_type' => 'string',
        'base_index_value' => 'decimal:2',
        'keys_grid_count' => 'integer',
        'pdf_downloaded_at' => 'datetime',
        'lease_downloaded_at' => 'datetime',
        'inventory_downloaded_at' => 'datetime',
    ];

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

    public function guarantors()
    {
        return $this->belongsToMany(Guarantor::class)->withTimestamps();
    }

    /**
     * Obtenir tous les documents associes a ce bail.
     */
    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    /**
     * Verifie si le bail possede toutes les informations requises pour generer le PDF.
     * Retourne un tableau vide si tout est bon, sinon la liste des erreurs.
     */
    public function getMissingPdfDataAttribute(): array
    {
        $missing = [];

        // --- 1. VÉRIFICATION DES LOCATAIRES ---
        if (!$this->relationLoaded('tenants') || $this->tenants->isEmpty()) {
            $missing[] = "Aucun locataire n'est rattaché à ce bail (ou données non chargées)";
            return $missing;
        }

        foreach ($this->tenants as $tenant) {
            $name = trim($tenant->first_name . ' ' . $tenant->last_name);

            if ($tenant->tenant_type === 'legal_entity') {
                if (!$tenant->company_name) $missing[] = "Raison sociale manquante pour le locataire ($name)";
                if (!$tenant->siret)         $missing[] = "SIRET manquant pour le locataire ($name)";
            } else {
                if (!$tenant->current_address)                      $missing[] = "Adresse manquante pour le locataire ($name)";
                if (!$tenant->birth_date || !$tenant->birth_place)  $missing[] = "Date ou lieu de naissance manquant pour le locataire ($name)";
                if (!$tenant->nationality)                          $missing[] = "Nationalité manquante pour le locataire ($name)";
            }

            if (!$tenant->phone) $missing[] = "Téléphone manquant pour le locataire ($name)";
        }

        // --- 2. VÉRIFICATION DES GARANTS DU BAIL ---
        // On vérifie uniquement les garants qui ont été cochés/liés à CE bail spécifiquement
        if ($this->relationLoaded('guarantors') && $this->guarantors->isNotEmpty()) {
            foreach ($this->guarantors as $guarantor) {
                // Les garants Visale n'ont pas besoin de ces infos pour le PDF
                if ($guarantor->type === 'visale') continue;

                $gName = trim($guarantor->first_name . ' ' . $guarantor->last_name);

                if (!$guarantor->current_address) $missing[] = "Adresse manquante pour le garant ($gName)";
                if (!$guarantor->phone) $missing[] = "Téléphone manquant pour le garant ($gName)";
            }
        }

        // --- 3. VÉRIFICATION DES CHAMPS SPÉCIFIQUES AU BAIL COMMERCIAL / PROFESSIONNEL ---
        if (in_array($this->lease_type, ['commercial', 'professional'])) {
            if (!$this->activity_description) $missing[] = "Description de l'activité manquante";
            if (!$this->insurer_name)          $missing[] = "Nom de l'assurance manquant";
            if (!$this->insurer_address)       $missing[] = "Adresse de l'assurance manquante";
            if (!$this->insurer_phone)         $missing[] = "Téléphone de l'assurance manquant";
            if (!$this->base_index_label)      $missing[] = "Libellé de l'indice de référence manquant";
            if (!$this->base_index_value)      $missing[] = "Valeur de l'indice de référence manquante";
        }

        return $missing;
    }

    /**
     * Verifie si le bail signé a ete uploade (document stocke sur le bail avec categorie 'signed_lease').
     */
    public function getHasSignedLeaseAttribute(): bool
    {
        if (!$this->relationLoaded('documents')) {
            return false;
        }

        return $this->documents->contains(fn($doc) => $doc->category === 'signed_lease');
    }

    /**
     * Verifie si l'etat des lieux d'entree signé a ete uploade.
     */
    public function getHasSignedInventoryAttribute(): bool
    {
        if (!$this->relationLoaded('documents')) {
            return false;
        }

        return $this->documents->contains(fn($doc) => $doc->category === 'signed_inventory');
    }

    /**
     * Les décomptes de charges annuelles liés à ce bail.
     */
    public function annualSettlements()
    {
        return $this->hasMany(TenantAnnualSettlement::class);
    }
}
