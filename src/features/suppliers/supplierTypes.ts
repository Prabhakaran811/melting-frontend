export interface Supplier {
  id: number;
  name: string;
  address: string;
  phone_number: string;
}

export interface CreateSupplierRequest {
  name: string;
  address: string;
  phone_number: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  address?: string;
  phone_number?: string;
}