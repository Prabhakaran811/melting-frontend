export interface StockWire {
  id: number;
  name: string;
}

export interface WireStockSupplier {
  id: number;
  name: string;
}

export interface WireStock {
  id: number;
  wire_id: number;
  wire: StockWire | null;
  powder_weight_per_meter: number | string;
  quantity: number | string;
  supplier_id: number;
  supplier: WireStockSupplier | null;
  rate_per_meter: number | string;
  created_at: string;
  updated_at: string;
}

export interface CreateWireStockRequest {
  wire_id: number;
  powder_weight_per_meter: number;
  quantity: number;
  supplier_id: number;
  rate_per_meter: number;
}

export type UpdateWireStockRequest = CreateWireStockRequest;