export interface Product {
  id: number;
  product_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  product_name: string;
}

export type UpdateProductRequest = CreateProductRequest;

export interface DeleteProductResponse {
  message: string;
}