import documentSchema from '@/Schemas/DocumentSchema';
import { z } from 'zod';

// 1. Le schéma de base (utilisé par la page Create)
const createGuarantorSchema = z.object({
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
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
    guarantor_id: z.string().optional().or(z.number().optional()).or(z.literal('')),
    // On rend le prénom et le nom optionnels au cas où l'utilisateur sélectionne un garant existant
    first_name: z.string().optional().or(z.literal('')),
    last_name: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    // Si AUCUN garant existant n'est sélectionné (donc on crée un nouveau garant)
    if (!data.guarantor_id) {
      // Le prénom devient obligatoire
      if (!data.first_name || data.first_name.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Le prénom est requis pour un nouveau garant',
          path: ['first_name'],
        });
      }

      // Le nom devient obligatoire
      if (!data.last_name || data.last_name.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Le nom est requis pour un nouveau garant',
          path: ['last_name'],
        });
      }
    }
  });

export default createGuarantorSchema;
