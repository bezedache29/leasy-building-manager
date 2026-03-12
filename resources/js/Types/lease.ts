import { Property } from '@/Types/property';
import { Tenant } from '@/Types/tenant';

// Interface pour le contrat de location (Bail)
export interface Lease {
  id: number;
  property_id: number;
  start_date: string;
  end_date: string | null;
  rent_amount: number;
  charges_amount: number;
  deposit_amount: number | null;
  payment_day: number;
  status: 'active' | 'terminated' | string;

  property?: Property;
  tenants?: Tenant[];

  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
