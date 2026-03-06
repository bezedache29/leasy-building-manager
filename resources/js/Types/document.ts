export interface AppDocument {
  id: number;
  documentable_type: string;
  documentable_id: number;
  name: string;
  file_path: string;
  category: string | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
}
