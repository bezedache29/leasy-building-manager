import { AppDocument } from '@/Types/document';
import { Guarantor } from '@/Types/guarantor';
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
  lease_type: 'residential' | 'commercial' | 'professional';

  // Champs commerciaux / professionnels
  activity_description: string | null;
  base_index_label: string | null;
  base_index_value: number | null;
  // Assurance et clés
  insurer_name: string | null;
  insurer_address: string | null;
  insurer_phone: string | null;
  keys_building_count: number;
  keys_mailbox_count: number;
  keys_apartment_count: number;
  keys_grid_count: number;
  pdf_downloaded_at?: string | null;

  // Attributs calculés renvoyés par le backend
  missing_pdf_data?: string[];
  has_signed_lease?: boolean;
  has_signed_inventory?: boolean;

  property?: Property;
  tenants?: Tenant[];
  documents?: AppDocument[];
  guarantors?: Guarantor[];

  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
