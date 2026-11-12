export interface Wrapped<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ReportElement {
  id: number;
  name: string;
  abbreviation: string;
  sequence_order: number;
}

export interface ReportChargeElement {
  id: number;
  element_id: number;
  percentage: number | string;
  element: ReportElement | null;
}

export interface ReportChargeItem {
  id: number;
  raw_material_stock_id: number;
  weight: number | string;
  rate_per_kg: number | string;
  bunker_name: string | null;
  raw_material_stock?: {
    id: number;
    raw_material_id: number;
    supplier_id?: number;
    received_date?: string;
  } | null;
  elements: ReportChargeElement[];
  total_cost: number | string;
}

export interface ReportChargeMix {
  id: number;
  furnace_cycle_id: number;
  charging_capacity: number | string;
  total_charged_weight: number | string;
  status: string;
  confirmed_at: string | null;
  items: ReportChargeItem[];
  total_cost: number | string;
  remaining_capacity: number | string;
}

export interface ReportSpectrumElement {
  id: number;
  element_symbol: string;
  element_name: string;
  percentage: number | string;
}

export interface ReportSpectrumResult {
  id: number;
  test_number: number;
  test_stage: string | null;
  operator_name: string | null;
  result_status: string | null;
  raw_payload?: string;
  received_at: string | null;
  elements: ReportSpectrumElement[];
}

export interface ReportRow {
  cycle: {
    id: number;
    furnace_id: number;
    order_id: number;
    heat_no: string;
    furnace_capacity: number | string;
    status: string;
    active_stage: string;
    started_at: string;
    completed_at: string | null;
  };
  furnace: {
    id: number;
    name: string;
    furnace_no: string;
    ref_no?: string;
  } | null;
  order: {
    id: number;
    order_number: string;
    status: string;
    customer_delivery_date: string;
  } | null;
  aim: {
    id: number;
    customer_id: number;
    product_id: number;
    drawing_no: string;
    iron_type_id?: number;
  } | null;
  charge_mix: ReportChargeMix | null;
  spectrum_results: ReportSpectrumResult[];
  summary: {
    furnace_capacity: number | string;
    total_charged_weight: number | string;
    total_charge_cost: number | string;
    total_spectrum_tests: number;
    cycle_status: string;
    started_at: string;
    completed_at: string | null;
  };
}

export interface ReportPagination {
  page: number;
  page_size: number;
  total_records: number;
  total_pages: number;
}

export interface ReportData {
  items: ReportRow[];
  pagination: ReportPagination;
}

export interface ReportQueryArgs {
  page: number;
  page_size: number;
  from_date?: string;
  to_date?: string;
}

// ---------- Formatting helpers ----------

export const money = (value: number | string): string =>
  Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const kg = (value: number | string): string =>
  Number(value).toLocaleString("en-IN", { maximumFractionDigits: 3 });

// "12 Nov 2026, 14:40"
export const formatStarted = (iso: string | null | undefined): string => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
};

// "7m 16s" / "2h 10m"
export const formatDuration = (start: string, end: string | null): string => {
  if (!end) return "In progress";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "-";

  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

// Date -> YYYY-MM-DD in local time
export const toDateString = (d: Date): string => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};