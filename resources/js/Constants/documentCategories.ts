// Le dictionnaire global pour l'affichage
export const DOCUMENT_CATEGORIES: Record<string, string> = {
  // Résidentiel
  id_card: "Pièce d'identité",
  proof_of_address: 'Justificatif de domicile',
  employment_contract: 'Justificatif de statut (Contrat, Kbis, Retraite)',
  payslip: 'Justificatif de revenus (Fiches de paie, Pension)',
  tax_notice: "Avis d'imposition",
  bank_details: 'RIB',
  guarantee_deed: 'Acte de caution solidaire',
  visale_guarantee: 'Garantie Visale (Action Logement)',
  insurance: "Attestation d'assurance",
  deposit_check: 'Chèque de caution',
  // Commercial
  kbis: 'Extrait Kbis (moins de 3 mois)',
  kbis_urssaf: 'Attestation URSSAF / Extrait Kbis',
  company_statutes: 'Statuts de la société',
  balance_sheet: 'Bilan comptable (2 derniers)',
  tax_filing: 'Liasse fiscale',
  bank_statement_pro: 'Relevés bancaires professionnels',
  activity_forecast: "Prévisionnel d'activité",
  other: 'Autre document',
};

// Docs REQUIS pour valider la complétude résidentielle (miroir du backend)
export const RESIDENTIAL_REQUIRED_DOC_KEYS = [
  'id_card',
  'proof_of_address',
  'employment_contract',
  'payslip',
  'tax_notice',
];

// Docs REQUIS pour valider la complétude commerciale auto-entrepreneur (miroir du backend)
export const COMMERCIAL_PHYSICAL_REQUIRED_DOC_KEYS = [
  'id_card',
  'kbis_urssaf',
  'tax_notice',
  'bank_statement_pro',
  'activity_forecast',
];

// Docs REQUIS pour valider la complétude commerciale société (miroir du backend)
export const COMMERCIAL_LEGAL_ENTITY_REQUIRED_DOC_KEYS = [
  'id_card',
  'kbis',
  'company_statutes',
  'balance_sheet',
];

// La liste stricte pour le menu déroulant du Locataire résidentiel
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

// La liste stricte pour le menu déroulant du Locataire auto-entrepreneur
export const COMMERCIAL_PHYSICAL_DOCUMENT_KEYS = [
  'id_card',
  'kbis_urssaf',
  'tax_notice',
  'bank_statement_pro',
  'activity_forecast',
  'other',
];

// La liste stricte pour le menu déroulant du Locataire société
export const COMMERCIAL_LEGAL_ENTITY_DOCUMENT_KEYS = [
  'id_card',
  'kbis',
  'company_statutes',
  'balance_sheet',
  'tax_filing',
  'bank_details',
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
