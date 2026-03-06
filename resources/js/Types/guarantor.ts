import { AppDocument } from '@/Types/document';

export interface Guarantor {
  id: number;
  tenant_id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  current_address: string | null;
  birth_date: string | null;
  birth_place: string | null;
  profession: string | null;
  documents?: AppDocument[];

  created_at: string;
  updated_at: string;
}
