import { z } from 'zod';

// Schéma de validation pour un équipement
export const equipmentSchema = z.object({
  name: z.string().min(1, "Le nom de l'équipement est requis"),
  type: z.string().nullable().optional(),

  // Transformation propre pour forcer un entier
  quantity: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? NaN : Number(val)),
    z
      .number()
      .refine((val) => !isNaN(val) && val >= 1, { message: 'La quantité (min. 1) est obligatoire' })
  ),

  notes: z.string().nullable().optional(),
});
