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
        'tenant_type',
        'has_residential',
        'has_commercial',
        'first_name',
        'last_name',
        'marital_status',
        'email',
        'is_archived',
        'phone',
        'current_address',
        'birth_date',
        'birth_place',
        'nationality',
        'profession',
        'notes',
        // Champs commerciaux
        'siret',
        'company_name',
        'legal_form',
        'share_capital',
        'registered_office',
        'rcs_city',
    ];

    protected $casts = [
        'birth_date'      => 'date',
        'is_archived'     => 'boolean',
        'has_residential' => 'boolean',
        'has_commercial'  => 'boolean',
        'share_capital'   => 'decimal:2',
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
     * Vérifie si le profil résidentiel est complet.
     * Retourne false si le profil résidentiel n'est pas activé.
     */
    public function getIsResidentialCompleteAttribute(): bool
    {
        if (!($this->has_residential ?? true)) return false;

        $tenantCategories = $this->documents->pluck('category')->toArray();

        $requiredFields = ['first_name', 'last_name', 'marital_status', 'email', 'phone',
                           'current_address', 'birth_date', 'birth_place', 'nationality', 'profession'];
        foreach ($requiredFields as $field) {
            if (empty($this->{$field})) return false;
        }

        $requiredDocs = ['id_card', 'proof_of_address', 'employment_contract', 'payslip', 'tax_notice'];
        if (!empty(array_diff($requiredDocs, $tenantCategories))) return false;

        if ($this->guarantors->isEmpty()) return false;

        $guarantorRequiredFields = ['first_name', 'last_name', 'marital_status', 'email', 'phone',
                                    'current_address', 'birth_date', 'birth_place', 'nationality', 'profession'];
        $guarantorRequiredDocs = ['id_card', 'proof_of_address', 'employment_contract', 'payslip', 'tax_notice'];

        foreach ($this->guarantors as $guarantor) {
            if ($guarantor->type === 'visale') {
                $gCats = $guarantor->documents->pluck('category')->toArray();
                if (!in_array('visale_guarantee', $gCats)) return false;
                continue;
            }
            foreach ($guarantorRequiredFields as $field) {
                if (empty($guarantor->{$field})) return false;
            }
            $gCats = $guarantor->documents->pluck('category')->toArray();
            if (!empty(array_diff($guarantorRequiredDocs, $gCats))) return false;
        }

        return true;
    }

    /**
     * Vérifie si le profil commercial est complet.
     * Retourne false si le profil commercial n'est pas activé.
     */
    public function getIsCommercialCompleteAttribute(): bool
    {
        if (!($this->has_commercial ?? false)) return false;

        $tenantCategories = $this->documents->pluck('category')->toArray();

        if ($this->tenant_type === 'legal_entity') {
            $requiredFields = ['company_name', 'legal_form', 'siret', 'registered_office', 'rcs_city',
                               'first_name', 'last_name', 'birth_date', 'birth_place', 'nationality', 'current_address'];
            foreach ($requiredFields as $field) {
                if (empty($this->{$field})) return false;
            }
            $requiredDocs = ['id_card', 'kbis', 'company_statutes', 'balance_sheet'];
            if (!empty(array_diff($requiredDocs, $tenantCategories))) return false;
        } else {
            // Personne physique auto-entrepreneur
            $requiredFields = ['first_name', 'last_name', 'email', 'phone', 'current_address',
                               'birth_date', 'birth_place', 'nationality', 'siret'];
            foreach ($requiredFields as $field) {
                if (empty($this->{$field})) return false;
            }
            $requiredDocs = ['id_card', 'kbis_urssaf', 'tax_notice', 'bank_statement_pro', 'activity_forecast'];
            if (!empty(array_diff($requiredDocs, $tenantCategories))) return false;
        }

        return true;
    }

    /**
     * Retourne true si TOUS les profils actifs sont complets.
     */
    public function getIsCompleteAttribute(): bool
    {
        $hasResidential = $this->has_residential ?? true;
        $hasCommercial  = $this->has_commercial ?? false;

        if ($hasResidential && $hasCommercial) {
            return $this->is_residential_complete && $this->is_commercial_complete;
        }
        if ($hasCommercial) {
            return $this->is_commercial_complete;
        }
        return $this->is_residential_complete;
    }

    // Un locataire peut être rattaché à plusieurs baux (historique)
    public function leases(): BelongsToMany
    {
        return $this->belongsToMany(Lease::class)
            ->withPivot('is_main_tenant')
            ->withTimestamps();
    }

    /**
     * Retourne la liste exacte des champs et documents manquants pour TOUS les profils actifs.
     * Structure rétro-compatible : missing_items.tenant.fields / .documents / .guarantors
     */
    public function getMissingItemsAttribute(): array
    {
        $missing = [
            'tenant'     => ['fields' => [], 'documents' => []],
            'guarantors' => [],
            'leases'     => [],
        ];

        $hasResidential = $this->has_residential ?? true;
        $hasCommercial  = $this->has_commercial ?? false;
        $isLegalEntity  = $this->tenant_type === 'legal_entity';

        $tenantCategories = $this->documents->pluck('category')->toArray();

        $allFieldLabels = [
            'first_name'        => 'Prénom',
            'last_name'         => 'Nom',
            'marital_status'    => 'Statut marital',
            'email'             => 'Email',
            'phone'             => 'Téléphone',
            'current_address'   => 'Adresse actuelle',
            'birth_date'        => 'Date de naissance',
            'birth_place'       => 'Lieu de naissance',
            'nationality'       => 'Nationalité',
            'profession'        => 'Profession',
            'siret'             => 'Numéro SIRET',
            'company_name'      => 'Raison sociale',
            'legal_form'        => 'Forme juridique',
            'registered_office' => 'Siège social',
            'rcs_city'          => 'Ville RCS',
        ];

        $allDocLabels = [
            'id_card'             => "Pièce d'identité",
            'proof_of_address'    => 'Justificatif de domicile',
            'employment_contract' => 'Justificatif de statut professionnel',
            'payslip'             => 'Justificatif de revenus',
            'tax_notice'          => "Avis d'imposition",
            'bank_details'        => 'RIB',
            'insurance'           => "Attestation d'assurance",
            'deposit_check'       => 'Chèque de caution',
            'kbis'                => 'Extrait Kbis (moins de 3 mois)',
            'kbis_urssaf'         => 'Attestation URSSAF / Extrait Kbis',
            'company_statutes'    => 'Statuts de la société',
            'balance_sheet'       => 'Bilan comptable (2 derniers)',
            'tax_filing'          => 'Liasse fiscale',
            'bank_statement_pro'  => 'Relevés bancaires professionnels',
            'activity_forecast'   => "Prévisionnel d'activité",
        ];

        // --- Profil résidentiel ---
        if ($hasResidential) {
            $label = $hasCommercial ? ' (résidentiel)' : '';

            $requiredFieldKeys = ['first_name', 'last_name', 'marital_status', 'email', 'phone',
                                   'current_address', 'birth_date', 'birth_place', 'nationality', 'profession'];
            foreach ($requiredFieldKeys as $field) {
                if (empty($this->{$field})) {
                    $missing['tenant']['fields'][] = ($allFieldLabels[$field] ?? $field) . $label;
                }
            }

            $requiredDocKeys = ['id_card', 'proof_of_address', 'employment_contract', 'payslip', 'tax_notice'];
            foreach (array_diff($requiredDocKeys, $tenantCategories) as $docKey) {
                $missing['tenant']['documents'][] = ($allDocLabels[$docKey] ?? $docKey) . $label;
            }

            // Garant obligatoire en résidentiel
            if ($this->guarantors->isEmpty()) {
                $missing['guarantors'][] = [
                    'id'        => null,
                    'name'      => 'Aucun garant',
                    'fields'    => ['Au moins un garant est requis'],
                    'documents' => [],
                ];
            }

            $guarantorRequiredFields = ['first_name', 'last_name', 'marital_status', 'email', 'phone',
                                         'current_address', 'birth_date', 'birth_place', 'nationality', 'profession'];
            $guarantorRequiredDocs = ['id_card', 'proof_of_address', 'employment_contract', 'payslip', 'tax_notice'];

            foreach ($this->guarantors as $guarantor) {
                $gMissing    = ['id' => $guarantor->id, 'name' => trim($guarantor->first_name . ' ' . $guarantor->last_name), 'fields' => [], 'documents' => []];
                $gCategories = $guarantor->documents->pluck('category')->toArray();

                if ($guarantor->type === 'visale') {
                    if (!in_array('visale_guarantee', $gCategories)) {
                        $gMissing['documents'][] = 'Garantie Visale (Action Logement)';
                    }
                    if (!empty($gMissing['documents'])) $missing['guarantors'][] = $gMissing;
                    continue;
                }

                foreach ($guarantorRequiredFields as $field) {
                    if (empty($guarantor->{$field})) $gMissing['fields'][] = $allFieldLabels[$field] ?? $field;
                }
                foreach (array_diff($guarantorRequiredDocs, $gCategories) as $docKey) {
                    $gMissing['documents'][] = $allDocLabels[$docKey] ?? $docKey;
                }

                if (!empty($gMissing['fields']) || !empty($gMissing['documents'])) {
                    $missing['guarantors'][] = $gMissing;
                }
            }
        }

        // --- Profil commercial ---
        if ($hasCommercial) {
            $label = $hasResidential ? ' (commercial)' : '';

            if ($isLegalEntity) {
                $requiredFieldKeys = ['company_name', 'legal_form', 'siret', 'registered_office', 'rcs_city',
                                       'first_name', 'last_name', 'birth_date', 'birth_place', 'nationality', 'current_address'];
                $requiredDocKeys   = ['id_card', 'kbis', 'company_statutes', 'balance_sheet'];
            } else {
                $requiredFieldKeys = ['first_name', 'last_name', 'email', 'phone', 'current_address',
                                       'birth_date', 'birth_place', 'nationality', 'siret'];
                $requiredDocKeys   = ['id_card', 'kbis_urssaf', 'tax_notice', 'bank_statement_pro', 'activity_forecast'];
            }

            foreach ($requiredFieldKeys as $field) {
                $label_text = ($allFieldLabels[$field] ?? $field) . $label;
                // Éviter les doublons si le champ est déjà listé (profil résidentiel)
                if (!in_array($label_text, $missing['tenant']['fields'])) {
                    if (empty($this->{$field})) $missing['tenant']['fields'][] = $label_text;
                }
            }

            foreach (array_diff($requiredDocKeys, $tenantCategories) as $docKey) {
                $missing['tenant']['documents'][] = ($allDocLabels[$docKey] ?? $docKey) . $label;
            }
        }

        return $missing;
    }
}
