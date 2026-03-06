import { AppDocument } from '@/Types/document';
import { Guarantor } from '@/Types/guarantor';

export interface Tenant {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  current_address: string | null;
  birth_date: string | null;
  birth_place: string | null;
  profession: string | null;
  notes: string | null;
  guarantors?: Guarantor[];
  documents?: AppDocument[];

  created_at: string;
  updated_at: string;
}
