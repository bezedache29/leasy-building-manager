import { AppDocument } from '@/Types/document';

export interface Guarantor {
  id: number;
  type: 'human' | 'visale';
  visale_contract_number: string | null;
  first_name: string;
  last_name: string;
  marital_status: string | null;
  email: string | null;
  phone: string | null;
  current_address: string | null;
  birth_date: string | null;
  birth_place: string | null;
  nationality: string | null;
  profession: string | null;
  documents?: AppDocument[];

  pivot?: {
    relationship: string | null;
  };

  created_at: string;
  updated_at: string;
}
