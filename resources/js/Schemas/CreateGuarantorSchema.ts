import documentSchema from '@/Schemas/DocumentSchema';
import { z } from 'zod';

// 1. Le schéma de base (utilisé par la page Create)
// Les noms sont optionnels ici : le serveur les auto-remplit pour Visale,
// et guarantorModalSchema gère sa propre validation via superRefine.
const createGuarantorSchema = z.object({
  type: z.enum(['human', 'visale']).optional(),
  visale_contract_number: z.string().optional().or(z.literal('')),
  first_name: z.string().optional().or(z.literal('')),
  last_name: z.string().optional().or(z.literal('')),
  relationship: z.string().optional().or(z.literal('')),
  marital_status: z.string().optional().or(z.literal('')),
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide')
    .optional()
    .or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  current_address: z.string().optional().or(z.literal('')),
  birth_date: z.string().optional().nullable(),
  birth_place: z.string().optional().nullable(),
  nationality: z.string().nullable().optional(),
  profession: z.string().optional().or(z.literal('')),

  documents: z.array(documentSchema).optional(),
});

// 2. Le schéma étendu spécifiquement pour la Modale (Sélection existant / Édition)
export const guarantorModalSchema = createGuarantorSchema
  .extend({
    type: z.enum(['human', 'visale']),
    // Mode de saisie choisi dans la modale : sert uniquement à la validation cote client,
    // ignoré par le backend (non present dans la liste des champs valides du controller)
    mode: z.enum(['new', 'existing']).optional(),
    guarantor_id: z.string().optional().or(z.number().optional()).or(z.literal('')),
    // On rend le prénom et le nom optionnels au cas où l'utilisateur sélectionne un garant existant
    first_name: z.string().optional().or(z.literal('')),
    last_name: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    // Visale : pas de validation sur les noms (remplis automatiquement côté serveur)
    if (data.type === 'visale') return;

    // Mode "garant existant" : seule la sélection compte, pas d'identité à saisir
    if (data.mode === 'existing') {
      if (!data.guarantor_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sélectionnez un garant existant',
          path: ['guarantor_id'],
        });
      }
      return;
    }

    // Mode "nouveau garant" (ou édition) : prénom/nom requis
    if (!data.first_name || data.first_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le prénom est requis pour un nouveau garant',
        path: ['first_name'],
      });
    }
    if (!data.last_name || data.last_name.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le nom est requis pour un nouveau garant',
        path: ['last_name'],
      });
    }
  });

export default createGuarantorSchema;
