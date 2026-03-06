import z from 'zod';

const REQUIRED_MSG = 'Ce champ est requis';

const documentSchema = z.object({
  file: z.instanceof(File, { message: 'Fichier invalide ou manquant' }),
  category: z.string().min(1, REQUIRED_MSG),
  name: z.string().min(1, REQUIRED_MSG),
});

export default documentSchema;
