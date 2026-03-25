import { Lease } from '@/Types/lease';

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
  rooms?: Room[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  leases?: Lease[];
}

// Interface pour les pièces
export interface Room {
  id: number;
  property_id: number;
  name: string;
  surface_area: number | null;
  equipments?: Equipment[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Interface pour les équipements
export interface Equipment {
  id: number;
  room_id: number;
  name: string;
  type: string | null;
  quantity: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
