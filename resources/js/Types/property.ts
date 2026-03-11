export interface Property {
  id: number;
  name: string;
  type: 'studio' | 'apartment' | 'commercial' | 'garage' | 'other';
  floor: number;
  surface_area: number | null; // en m²
  tantiemes_water: number | null; // Base 10000
  tantiemes_commons: number | null; // Base 1000
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
