import { z } from 'zod';

const editTenantSchema = z.object({
  tenant_type: z.union([z.literal('physical'), z.literal('legal_entity')]),
  has_residential: z.boolean(),
  has_commercial: z.boolean(),
  first_name: z.string().min(1, 'Le prénom est obligatoire'),
  last_name: z.string().min(1, 'Le nom est obligatoire'),
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide')
    .optional()
    .or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  current_address: z.string().optional().or(z.literal('')),
  birth_date: z.string().optional().or(z.literal('')),
  birth_place: z.string().optional().or(z.literal('')),
  nationality: z.string().optional().or(z.literal('')),
  profession: z.string().optional().or(z.literal('')),
  marital_status: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  // Champs commerciaux (tous optionnels — la complétude est gérée côté serveur)
  siret: z.string().max(20).optional().or(z.literal('')),
  company_name: z.string().optional().or(z.literal('')),
  legal_form: z.string().optional().or(z.literal('')),
  share_capital: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v) => (v === '' || v == null ? null : Number(v)))
    .refine((v) => v === null || v === undefined || v >= 0, {
      message: 'Le capital social doit être positif ou nul',
    }),
  registered_office: z.string().optional().or(z.literal('')),
  rcs_city: z.string().optional().or(z.literal('')),

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
