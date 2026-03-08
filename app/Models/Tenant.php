<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'first_name',
        'last_name',
        'marital_status',
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

    /**
     * Ajoute l'attribut calculé "is_complete" lors de la sérialisation JSON
     */
    protected $appends = ['is_complete', 'missing_items'];

    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    public function guarantors()
    {
        return $this->belongsToMany(Guarantor::class)
            ->withPivot('relationship')
            ->withTimestamps();
    }

    /**
     * Détermine si le dossier du locataire (et de ses garants) est 100% complet.
     */
    public function getIsCompleteAttribute(): bool
    {
        // --- 1. VÉRIFICATION DES CHAMPS DU LOCATAIRE ---
        $tenantRequiredFields = [
            'first_name',
            'last_name',
            'marital_status',
            'email',
            'phone',
            'current_address',
            'birth_date',
            'birth_place',
            'profession'
        ];

        foreach ($tenantRequiredFields as $field) {
            // empty() vérifie si c'est null, une chaîne vide '', etc.
            if (empty($this->{$field})) {
                return false;
            }
        }

        // --- 2. VÉRIFICATION DES DOCUMENTS DU LOCATAIRE ---
        $tenantRequiredDocs = [
            'id_card',
            'proof_of_address',
            'employment_contract',
            'payslip',
            'tax_notice',
            'bank_details',
            'insurance',
            'lease',
            'inventory',
            'deposit_check'
        ];

        // On récupère juste la liste des catégories uploadées
        $tenantCategories = $this->documents->pluck('category')->toArray();

        // S'il reste des éléments après avoir soustrait les documents fournis, c'est qu'il en manque
        if (!empty(array_diff($tenantRequiredDocs, $tenantCategories))) {
            return false;
        }

        // --- 3. VÉRIFICATION DES GARANTS ---
        $guarantorRequiredFields = [
            'first_name',
            'last_name',
            'marital_status',
            'email',
            'phone',
            'current_address',
            'birth_date',
            'birth_place',
            'profession'
        ];

        $guarantorRequiredDocs = [
            'id_card',
            'proof_of_address',
            'employment_contract',
            'payslip',
            'tax_notice',
            'guarantee_deed'
        ];

        foreach ($this->guarantors as $guarantor) {
            // Vérification des champs de texte du garant
            foreach ($guarantorRequiredFields as $field) {
                if (empty($guarantor->{$field})) {
                    return false;
                }
            }

            // Vérification des documents du garant
            $guarantorCategories = $guarantor->documents->pluck('category')->toArray();
            if (!empty(array_diff($guarantorRequiredDocs, $guarantorCategories))) {
                return false;
            }
        }

        return true;
    }

    /**
     * Retourne la liste exacte des champs et documents manquants.
     */
    public function getMissingItemsAttribute(): array
    {
        $missing = [
            'tenant' => ['fields' => [], 'documents' => []],
            'guarantors' => []
        ];

        $requiredFields = ['first_name', 'last_name', 'marital_status', 'email', 'phone', 'current_address', 'birth_date', 'birth_place', 'profession'];
        $tenantRequiredDocs = ['id_card', 'proof_of_address', 'employment_contract', 'payslip', 'tax_notice', 'bank_details', 'insurance', 'lease', 'inventory', 'deposit_check'];
        $guarantorRequiredDocs = ['id_card', 'proof_of_address', 'employment_contract', 'payslip', 'tax_notice', 'guarantee_deed'];

        // 1. Locataire
        foreach ($requiredFields as $field) {
            if (empty($this->{$field})) $missing['tenant']['fields'][] = $field;
        }
        $tenantCategories = $this->documents->pluck('category')->toArray();
        $missing['tenant']['documents'] = array_values(array_diff($tenantRequiredDocs, $tenantCategories));

        // 2. Garants
        foreach ($this->guarantors as $guarantor) {
            $gMissing = [
                'id' => $guarantor->id,
                'name' => trim($guarantor->first_name . ' ' . $guarantor->last_name),
                'fields' => [],
                'documents' => []
            ];

            foreach ($requiredFields as $field) {
                if (empty($guarantor->{$field})) $gMissing['fields'][] = $field;
            }
            $gCategories = $guarantor->documents->pluck('category')->toArray();
            $gMissing['documents'] = array_values(array_diff($guarantorRequiredDocs, $gCategories));

            if (!empty($gMissing['fields']) || !empty($gMissing['documents'])) {
                $missing['guarantors'][] = $gMissing;
            }
        }

        return $missing;
    }
}
