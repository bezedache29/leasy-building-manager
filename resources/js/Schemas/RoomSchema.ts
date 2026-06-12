import { z } from 'zod';

// Schéma de validation pour une pièce
export const roomSchema = z.object({
  name: z.string().min(1, 'Le nom de la pièce est requis'),

  // Transformation propre pour accepter un nombre ou null si le champ est vide
  surface_area: z.preprocess(
    (val) => (val === '' || val === null ? null : Number(val)),
    z.number().nullable().optional()
  ),
});
