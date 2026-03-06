import z from 'zod';

const REQUIRED_MSG = 'Ce champ est requis';
const REQUIRED_FILE_MSG = 'Fichier invalide ou manquant';

const documentSchema = z.object({
  file: z.instanceof(File, { message: REQUIRED_FILE_MSG }).nullable(),
  category: z.string().min(1, REQUIRED_MSG),
  name: z.string().min(1, REQUIRED_MSG),
});

export default documentSchema;
