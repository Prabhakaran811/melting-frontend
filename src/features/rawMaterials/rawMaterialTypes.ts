export interface RawMaterialIronType {
  id: number;
  name: string;
}

export interface RawMaterialElement {
  id: number;
  name: string;
  abbreviation: string;
  sequence_order: number;
  iron_types: RawMaterialIronType[];
}

export interface RawMaterial {
  id: number;
  name: string;
  elements: RawMaterialElement[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateRawMaterialRequest {
  name: string;
  element_ids: number[];
}

export type UpdateRawMaterialRequest = CreateRawMaterialRequest;