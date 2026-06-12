import createGuarantorSchema from '@/Schemas/CreateGuarantorSchema';
import documentSchema from '@/Schemas/DocumentSchema';
import { z } from 'zod';

const REQUIRED_MSG = 'Ce champ est requis';

const createTenantSchema = z.object({
  tenant_type: z.union([z.literal('physical'), z.literal('legal_entity')]),
  has_residential: z.boolean(),
  has_commercial: z.boolean(),
  first_name: z.string().min(1, REQUIRED_MSG),
  last_name: z.string().min(1, REQUIRED_MSG),
  marital_status: z.string().optional().or(z.literal('')),
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide')
    .optional()
    .or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  current_address: z.string().optional().or(z.literal('')),
  birth_date: z.string().optional().or(z.literal('')),
  birth_place: z.string().optional().or(z.literal('')),
  nationality: z.string().nullable().optional(),
  profession: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  // Champs commerciaux (tous optionnels — la complétude est gérée côté serveur)
  siret: z.string().max(20).optional().or(z.literal('')),
  company_name: z.string().optional().or(z.literal('')),
  legal_form: z.string().optional().or(z.literal('')),
  share_capital: z.coerce.number().min(0).optional().nullable(),
  registered_office: z.string().optional().or(z.literal('')),
  rcs_city: z.string().optional().or(z.literal('')),

  // Le tableau dynamique des garants
  guarantors: z.array(createGuarantorSchema).optional(),

  // Le tableau dynamique des documents
  tenant_documents: z.array(documentSchema).optional(),
});

export default createTenantSchema;
