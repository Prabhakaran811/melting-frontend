export interface Wrapped<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Furnace {
  id: number;
  name: string;
  furnace_no: string;
  ref_no?: string;
  capacity: number | string;
  is_active: boolean;
  status?: string; // derived: "Running" / "Available" ...
}

export interface FurnaceCycle {
  id: number;
  furnace_id: number;
  order_id: number;
  heat_no: string;
  furnace_capacity?: number | string;
  status: string; // Running | Completed | Cancelled
  active_stage: string;
  started_at: string;
  completed_at: string | null;
}

export interface ChargeItemElement {
  element_id?: number;
  percentage: number | string;
  element?: { id: number; name: string; abbreviation: string } | null;
}

export interface ChargeItem {
  id: number;
  raw_material_stock_id?: number;
  raw_material_name?: string;
  raw_material?: { id: number; name: string } | null;
  weight: number | string;
  rate_per_kg?: number | string;
  bunker_name?: string | null;
  elements?: ChargeItemElement[];
}

export interface ChargeMix {
  id: number;
  furnace_cycle_id?: number;
  charging_capacity: number | string;
  total_charged_weight: number | string;
  remaining_capacity?: number | string;
  status: string; // Draft | Confirmed
  confirmed_at?: string | null;
  items?: ChargeItem[];
}

// ---------- Charge mix request bodies ----------
export interface ChargeMixItemInput {
  raw_material_stock_id: number;
  weight: number;
  rate_per_kg: number;
  bunker_name: string;
  elements: { element_id: number; percentage: number }[];
}

export interface CreateChargeMixRequest {
  charging_capacity: number;
  items: ChargeMixItemInput[];
}

export interface UpdateChargeMixRequest {
  items: ChargeMixItemInput[];
}

export interface SpectrumResult {
  id: number;
  test_number: number;
  test_stage?: string;
  operator_name?: string;
  result_status?: string;
  received_at?: string;
  elements: Record<string, number | string>;
}

export interface DashboardOrder {
  id?: number;
  order_number?: string;
  status?: string;
  customer_delivery_date?: string;
  aim?: {
    customer?: { customer_name: string } | null;
    product?: { product_name: string } | null;
    drawing_no?: string;
    iron_type?: { name: string } | null;
  } | null;
}

export interface FurnaceDetails {
  furnace: Furnace | null;
  current_cycle: FurnaceCycle | null;
  order: DashboardOrder | null;
  charge_mix: ChargeMix | null;
  spectrum_results: SpectrumResult[];
}

export interface SpectrumComparisonElement {
  element: string;
  aim_min: number;
  aim_max: number;
  actual_value: number | null;
  status: string; // OK | NOT OK
}

export interface SpectrumComparison {
  cycle_id: number;
  heat_no?: string;
  test_number: number;
  overall_status: string;
  passed_count: number;
  failed_count: number;
  elements: SpectrumComparisonElement[];
}

// Controlled list of stages (same order as the backend)
export const CYCLE_STAGES = [
  "Charging",
  "Charge Confirmed",
  "Spectrum Testing",
  "Quality Review",
  "Completed",
];

export const formatDateTime = (value?: string | null): string => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};