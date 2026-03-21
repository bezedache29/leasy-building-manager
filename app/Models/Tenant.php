<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'nationality',
        'profession',
        'notes'
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

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
            'nationality',
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
            'nationality',
            'profession'
        ];

        $guarantorRequiredDocs = [
            'id_card',
            'proof_of_address',
            'employment_contract',
            'payslip',
            'tax_notice'
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

    // Un locataire peut être rattaché à plusieurs baux (historique)
    public function leases(): BelongsToMany
    {
        return $this->belongsToMany(Lease::class)
            ->withPivot('is_main_tenant')
            ->withTimestamps();
    }

    /**
     * Retourne la liste exacte des champs et documents manquants traduits en français.
     */
    public function getMissingItemsAttribute(): array
    {
        $missing = [
            'tenant' => ['fields' => [], 'documents' => []],
            'guarantors' => [],
            'leases' => [],
        ];

        // Dictionnaire de traduction pour les champs
        $fieldLabels = [
            'first_name' => 'Prénom',
            'last_name' => 'Nom',
            'marital_status' => 'Statut marital',
            'email' => 'Email',
            'phone' => 'Téléphone',
            'current_address' => 'Adresse actuelle',
            'birth_date' => 'Date de naissance',
            'birth_place' => 'Lieu de naissance',
            'nationality' => 'Nationalité',
            'profession' => 'Profession'
        ];

        // Dictionnaire de traduction pour les documents
        $docLabels = [
            'id_card' => "Pièce d'identité",
            'proof_of_address' => 'Justificatif de domicile',
            'employment_contract' => 'Contrat de travail / Scolarité / Kbis',
            'payslip' => 'Fiches de paie / Rémunération',
            'tax_notice' => "Dernier avis d'imposition",
            'bank_details' => 'RIB',
            'insurance' => "Attestation d'assurance",
            'lease' => 'Bail',
            'inventory' => 'État des lieux',
            'deposit_check' => 'Chèque de caution',
            'guarantee_deed' => 'Acte de caution solidaire'
        ];

        $tenantRequiredDocs = ['id_card', 'proof_of_address', 'employment_contract', 'payslip', 'tax_notice'];
        $guarantorRequiredDocs = ['id_card', 'proof_of_address', 'employment_contract', 'payslip', 'tax_notice'];

        // 1. Locataire
        foreach ($fieldLabels as $field => $label) {
            if (empty($this->{$field})) {
                $missing['tenant']['fields'][] = $label;
            }
        }

        $tenantCategories = $this->documents->pluck('category')->toArray();
        $missingTenantDocs = array_diff($tenantRequiredDocs, $tenantCategories);
        foreach ($missingTenantDocs as $docKey) {
            $missing['tenant']['documents'][] = $docLabels[$docKey] ?? $docKey;
        }

        // 2. Garants
        foreach ($this->guarantors as $guarantor) {
            $gMissing = [
                'id' => $guarantor->id,
                'name' => trim($guarantor->first_name . ' ' . $guarantor->last_name),
                'fields' => [],
                'documents' => []
            ];

            // Champs du garant
            foreach ($fieldLabels as $field => $label) {
                if (empty($guarantor->{$field})) {
                    $gMissing['fields'][] = $label;
                }
            }

            // Documents du garant
            $gCategories = $guarantor->documents->pluck('category')->toArray();
            $missingGuarantorDocs = array_diff($guarantorRequiredDocs, $gCategories);
            foreach ($missingGuarantorDocs as $docKey) {
                $gMissing['documents'][] = $docLabels[$docKey] ?? $docKey;
            }

            if (!empty($gMissing['fields']) || !empty($gMissing['documents'])) {
                $missing['guarantors'][] = $gMissing;
            }
        }

        // Si absolument tout est complet, on retourne null
        if (
            empty($missing['tenant']['fields']) &&
            empty($missing['tenant']['documents']) &&
            empty($missing['guarantors']) &&
            empty($missing['leases'])
        ) {
            return $missing;
        }

        return $missing;
    }
}
