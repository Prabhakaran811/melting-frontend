export interface WireRawMaterial {
  id: number;
  name: string;
}

export interface Wire {
  id: number;
  name: string;
  raw_material_id: number;
  raw_material: WireRawMaterial | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWireRequest {
  name: string;
  raw_material_id: number;
}

export type UpdateWireRequest = CreateWireRequest;