import type { AimElementSpec } from "../aims/aimTypes";

export interface OrderAim {
  id: number;
  customer?: { id: number; customer_name: string } | null;
  product?: { id: number; product_name: string } | null;
  drawing_no?: string;
  iron_type?: { id: number; name: string } | null;
  packing?: { id: number; name: string } | null;
  hardness?: { id: number; hardness_name: string } | null;
  inoculant?: { id: number; name: string } | null;
  pouring_weight_kg?: number | string;
  casting_weight_kg?: number | string;
  no_of_casting?: number;
  no_of_cavity?: number;
  elements?: AimElementSpec[];
}

export interface Order {
  id: number;
  order_number: string;
  aim_id: number;
  aim: OrderAim | null;
  status: string;
  customer_delivery_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  aim_id: number;
  customer_delivery_date: string;
}

export interface UpdateOrderRequest {
  aim_id: number;
  status: string;
  customer_delivery_date: string;
}

// Adjust this list to the statuses your backend accepts
export const ORDER_STATUSES = ["Pending", "In Progress", "Completed", "Cancelled"];

export type StatusTone = "pending" | "progress" | "done" | "cancelled" | "other";

export const statusTone = (status: string): StatusTone => {
  const s = status.trim().toLowerCase();
  if (s === "pending") return "pending";
  if (s === "in progress" || s === "in_progress") return "progress";
  if (s === "completed" || s === "complete" || s === "delivered") return "done";
  if (s === "cancelled" || s === "canceled") return "cancelled";
  return "other";
};

// Today as YYYY-MM-DD in local time
export const todayString = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

// Open order whose delivery date has already passed
export const isOverdue = (order: Order): boolean => {
  const tone = statusTone(order.status);
  if (tone === "done" || tone === "cancelled") return false;
  return order.customer_delivery_date < todayString();
};