export interface StockRawMaterial {
  id: number;
  name: string;
}

export interface StockSupplier {
  id: number;
  name: string;
}

export interface StockElementPercentage {
  element_id: number;
  percentage: number | string;
  // Present only if your API nests the element details
  element?: {
    id: number;
    name: string;
    abbreviation: string;
  } | null;
}

export interface RawMaterialStock {
  id: number;
  raw_material_id: number;
  raw_material: StockRawMaterial | null;
  quantity: number | string;
  supplier_id: number;
  supplier: StockSupplier | null;
  received_date: string; // YYYY-MM-DD
  rate_per_kg: number | string;
  element_percentages: StockElementPercentage[];
  created_at: string;
  updated_at: string;
}

export interface ElementPercentageInput {
  element_id: number;
  percentage: number;
}

export interface CreateRawMaterialStockRequest {
  raw_material_id: number;
  quantity: number;
  supplier_id: number;
  received_date: string;
  rate_per_kg: number;
  element_percentages: ElementPercentageInput[];
}

export type UpdateRawMaterialStockRequest = CreateRawMaterialStockRequest;