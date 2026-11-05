export interface StockElement {
  id: number;
  name: string;
  abbreviation: string;
}

export interface StockSupplier {
  id: number;
  name: string;
}

export interface ElementStock {
  id: number;
  element_id: number;
  element: StockElement | null;
  quantity: number;
  supplier_id: number;
  supplier: StockSupplier | null;
  received_date: string; // YYYY-MM-DD
  pickup_percentage: number;
  rate_per_kg: number;
  created_at: string;
  updated_at: string;
}

export interface CreateElementStockRequest {
  element_id: number;
  quantity: number;
  supplier_id: number;
  received_date: string;
  pickup_percentage: number;
  rate_per_kg: number;
}

export type UpdateElementStockRequest = CreateElementStockRequest;