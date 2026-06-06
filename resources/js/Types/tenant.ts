import { AppDocument } from '@/Types/document';
import { Guarantor } from '@/Types/guarantor';
import { Lease } from '@/Types/lease';

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
  is_archived: boolean;
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
  leases?: Lease[];
  pivot?: {
    is_main_tenant: boolean | number; // Laravel peut renvoyer 1/0 ou true/false selon le SGBD
  };

  created_at: string;
  updated_at: string;
}
