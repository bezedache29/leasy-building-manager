import createGuarantorSchema from '@/Schemas/CreateGuarantorSchema';
import documentSchema from '@/Schemas/DocumentSchema';
import { z } from 'zod';

const REQUIRED_MSG = 'Ce champ est requis';

const createTenantSchema = z.object({
  first_name: z.string().min(1, REQUIRED_MSG),
  last_name: z.string().min(1, REQUIRED_MSG),
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide')
    .optional()
    .or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  current_address: z.string().optional().or(z.literal('')),
  birth_date: z.string().optional().or(z.literal('')),
  birth_place: z.string().optional().or(z.literal('')),
  profession: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),

  // Le tableau dynamique des garants
  guarantors: z.array(createGuarantorSchema).optional(),

  // Le tableau dynamique des documents
  tenant_documents: z.array(documentSchema).optional(),
});

export default createTenantSchema;
