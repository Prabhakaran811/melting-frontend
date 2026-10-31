export interface Customer {
  id: number;
  customer_name: string;
  address: string;
  phone_number: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerRequest {
  customer_name: string;
  address: string;
  phone_number: string;
  email: string;
}

export interface UpdateCustomerRequest {
  customer_name?: string;
  address?: string;
  phone_number?: string;
  email?: string;
  is_active?: boolean;
}