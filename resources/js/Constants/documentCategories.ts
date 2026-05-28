// Le dictionnaire global pour l'affichage
export const DOCUMENT_CATEGORIES: Record<string, string> = {
  id_card: "Pièce d'identité",
  proof_of_address: 'Justificatif de domicile',
  employment_contract: 'Justificatif de statut (Contrat, Kbis, Retraite)',
  payslip: 'Justificatif de revenus (Fiches de paie, Pension)',
  tax_notice: "Dernier avis d'imposition",
  bank_details: 'RIB',
  guarantee_deed: 'Acte de caution solidaire',
  visale_guarantee: 'Garantie Visale (Action Logement)',
  insurance: "Attestation d'assurance",
  deposit_check: 'Chèque de caution',
  other: 'Autre document',
};

// La liste stricte pour le menu déroulant du Locataire
export const TENANT_DOCUMENT_KEYS = [
  'id_card',
  'proof_of_address',
  'employment_contract',
  'payslip',
  'tax_notice',
  'bank_details',
  'insurance',
  'deposit_check',
  'other',
];

// La liste stricte pour le menu déroulant du Garant
export const GUARANTOR_DOCUMENT_KEYS = [
  'id_card',
  'proof_of_address',
  'employment_contract',
  'payslip',
  'tax_notice',
  'other',
];

// Catégorie unique pour un garant Visale
export const VISALE_DOCUMENT_KEYS = ['visale_guarantee'];
