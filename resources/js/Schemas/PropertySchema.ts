import { z } from 'zod';

export const propertySchema = z.object({
  name: z.string().min(1, 'Le nom du bien est requis'),
  type: z.enum(['apartment', 'studio', 'commercial', 'garage', 'other']),

  floor: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? NaN : Number(val)),
    z.number().refine((val) => !isNaN(val), { message: "L'étage est obligatoire" })
  ),

  surface_area: z.preprocess(
    (val) => (val === '' || val === null ? null : Number(val)),
    z.number().nullable()
  ),
  tantiemes_eau: z.preprocess(
    (val) => (val === '' || val === null ? null : Number(val)),
    z.number().nullable()
  ),
  tantiemes_communs: z.preprocess(
    (val) => (val === '' || val === null ? null : Number(val)),
    z.number().nullable()
  ),

  description: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type PropertyFormData = z.infer<typeof propertySchema>;
