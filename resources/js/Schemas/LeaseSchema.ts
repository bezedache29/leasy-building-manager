import { z } from 'zod';

export const leaseSchema = z
  .object({
    property_id: z.coerce.number().min(1, 'Veuillez sélectionner un bien'),
    tenant_ids: z.array(z.number()).min(1, 'Veuillez sélectionner au moins un locataire'),
    start_date: z.string().min(1, "La date d'entrée est requise"),
    end_date: z
      .string()
      .nullable()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: 'Format de date invalide',
      }),
    rent_amount: z.coerce.number().min(0, 'Le loyer doit être supérieur ou égal à 0'),
    charges_amount: z.coerce.number().min(0, 'Les charges doivent être supérieures ou égales à 0'),
    deposit_amount: z.preprocess(
      (val) => (val === '' || val === null ? null : Number(val)),
      z.number().min(0, 'Le dépôt de garantie doit être positif').nullable().optional()
    ),
    payment_day: z.coerce
      .number()
      .min(1, 'Le jour doit être au minimum 1')
      .max(31, 'Le jour doit être au maximum 31'),
  })
  .refine(
    (data) => {
      // Si pas de date de fin, la validation passe d'office
      if (!data.end_date) return true;

      const start = new Date(data.start_date);
      const end = new Date(data.end_date);

      return end >= start;
    },
    {
      message: "La date de sortie ne peut pas être antérieure à la date d'entrée",
      path: ['end_date'], // L'erreur s'affichera sous le champ end_date
    }
  );
