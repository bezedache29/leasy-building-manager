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

  // Nouveaux champs pour l'assurance et les cles
  insurer_name: string | null;
  insurer_address: string | null;
  insurer_phone: string | null;
  keys_building_count: number;
  keys_mailbox_count: number;
  keys_apartment_count: number;
  pdf_downloaded_at?: string | null;

  // Attribut calcule renvoye par le backend pour bloquer/autoriser le PDF
  missing_pdf_data?: string[];

  property?: Property;
  tenants?: Tenant[];
  documents?: AppDocument[];
  guarantors?: Guarantor[];

  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
