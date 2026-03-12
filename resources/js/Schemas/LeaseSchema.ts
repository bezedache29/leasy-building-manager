import { z } from 'zod';

export const leaseSchema = z.object({
  property_id: z.coerce.number().min(1, 'Veuillez sélectionner un bien'),

  tenant_ids: z.array(z.number()).min(1, 'Veuillez sélectionner au moins un locataire'),
  start_date: z.string().min(1, 'La date de début est requise'),
  end_date: z.string().nullable().optional(),

  rent_amount: z.preprocess(
    (val) => (val === '' ? NaN : Number(val)),
    z.number().min(0, 'Le loyer doit être positif')
  ),
  charges_amount: z.preprocess(
    (val) => (val === '' ? NaN : Number(val)),
    z.number().min(0, 'Les charges doivent être positives')
  ),
  deposit_amount: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().nullable().optional()
  ),
  payment_day: z.preprocess(
    (val) => (val === '' ? NaN : Number(val)),
    z.number().min(1, 'Minimum 1').max(31, 'Maximum 31')
  ),
});

export type LeaseFormData = z.infer<typeof leaseSchema>;
