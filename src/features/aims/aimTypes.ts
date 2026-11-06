export interface AimElementSpec {
  id: number;
  element_id?: number;
  element: {
    id: number;
    name: string;
    abbreviation: string;
  } | null;
  exact_value: number | string;
  plus_value: number | string;
  minus_value: number | string;
}

export interface Aim {
  id: number;
  customer: { id: number; customer_name: string } | null;
  product: { id: number; product_name: string } | null;
  drawing_no: string;
  iron_type: { id: number; name: string } | null;
  packing: { id: number; name: string } | null;
  hardness: { id: number; hardness_name: string } | null;
  inoculant: { id: number; name: string } | null;
  pouring_weight_kg: number | string;
  casting_weight_kg: number | string;
  no_of_casting: number;
  no_of_cavity: number;
  elements: AimElementSpec[];
  created_at: string;
  updated_at: string;
}

export interface AimElementInput {
  element_id: number;
  exact_value: number;
  plus_value: number;
  minus_value: number;
}

export interface CreateAimRequest {
  customer_id: number;
  product_id: number;
  drawing_no: string;
  iron_type_id: number;
  packing_id: number;
  hardness_id: number;
  inoculant_id: number;
  pouring_weight_kg: number;
  casting_weight_kg: number;
  no_of_casting: number;
  no_of_cavity: number;
  elements: AimElementInput[];
}

export type UpdateAimRequest = CreateAimRequest;

// Generic shape of the master lists used by the dropdowns
export interface LookupItem {
  id: number;
  name?: string;
  customer_name?: string;
  product_name?: string;
  hardness_name?: string;
}

export const lookupLabel = (item: LookupItem): string =>
  item.name ??
  item.customer_name ??
  item.product_name ??
  item.hardness_name ??
  `#${item.id}`;