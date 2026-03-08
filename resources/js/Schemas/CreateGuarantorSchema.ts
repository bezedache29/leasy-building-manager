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
  profession: z.string().optional().or(z.literal('')),

  documents: z.array(documentSchema).optional(),
});

// 2. Le schéma étendu spécifiquement pour la Modale (Sélection existant / Édition)
export const guarantorModalSchema = createGuarantorSchema.extend({
  guarantor_id: z.string().optional().or(z.number().optional()).or(z.literal('')),
  // On rend le prénom et le nom optionnels au cas où l'utilisateur sélectionne un garant existant
  first_name: z.string().optional().or(z.literal('')),
  last_name: z.string().optional().or(z.literal('')),
});

export default createGuarantorSchema;
