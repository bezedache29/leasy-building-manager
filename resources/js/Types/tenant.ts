import { AppDocument } from '@/Types/document';
import { Guarantor } from '@/Types/guarantor';

export interface Tenant {
  id: number;
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
  notes: string | null;
  property?: {
    id: number;
    name: string;
  };
  is_complete: boolean;
  missing_items: {
    tenant: {
      fields: string[];
      documents: string[];
    };
    guarantors: Array<{
      id: number;
      name: string;
      fields: string[];
      documents: string[];
    }>;
  };
  guarantors?: Guarantor[];
  documents?: AppDocument[];

  created_at: string;
  updated_at: string;
}
