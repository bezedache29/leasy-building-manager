import documentSchema from '@/Schemas/DocumentSchema';
import { z } from 'zod';

const createGuarantorSchema = z.object({
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
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

export default createGuarantorSchema;
