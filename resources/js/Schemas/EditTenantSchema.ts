import { z } from 'zod';

// Définition du schéma de validation pour l'édition d'un locataire
const editTenantSchema = z.object({
  first_name: z.string().min(1, 'Le prénom est obligatoire'),
  last_name: z.string().min(1, 'Le nom est obligatoire'),

  // L'email peut être vide, mais s'il est rempli, il doit être valide
  email: z.string().email("Format d'email invalide").or(z.literal('').or(z.null())),

  // Tous les autres champs sont optionnels et peuvent être vides ou nuls
  phone: z.string().nullable().optional(),
  current_address: z.string().nullable().optional(),
  birth_date: z.string().nullable().optional(),
  birth_place: z.string().nullable().optional(),
  nationality: z.string().nullable().optional(),
  profession: z.string().nullable().optional(),
  marital_status: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),

  tenant_documents: z
    .array(
      z.object({
        category: z.string().min(1, 'Catégorie requise'),
        name: z.string().min(1, 'Nom requis'),
        file: z.any().refine((file) => file instanceof File, 'Fichier requis'),
      })
    )
    .optional(),
});

export default editTenantSchema;
