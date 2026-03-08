// Le dictionnaire global pour l'affichage
export const DOCUMENT_CATEGORIES: Record<string, string> = {
  id_card: "Pièce d'identité",
  proof_of_address: 'Justificatif de domicile',
  employment_contract: 'Contrat de travail / Scolarité / Kbis',
  payslip: 'Fiches de paie / Rémunération',
  tax_notice: "Dernier avis d'imposition",
  bank_details: 'RIB',
  guarantee_deed: 'Acte de cautionnement solidaire',
  insurance: "Attestation d'assurance",
  lease: 'Bail signé',
  inventory: 'État des lieux signé',
  deposit_check: 'Chèque de caution',
  other: 'Autre',
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
  'lease',
  'inventory',
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
  'guarantee_deed',
  'other',
];
