export interface Furnace {
  id: number;
  name: string;
  furnace_no: string;
  ref_no: string;
  capacity: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFurnaceRequest {
  name: string;
  furnace_no: string;
  ref_no: string;
  capacity: number;
}

export type UpdateFurnaceRequest = CreateFurnaceRequest;

export interface UpdateFurnaceStatusRequest {
  is_active: boolean;
}