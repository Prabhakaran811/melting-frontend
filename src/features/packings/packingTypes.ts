export interface Packing {
  id: number;
  name: string;
}

export interface CreatePackingRequest {
  name: string;
}

export type UpdatePackingRequest = CreatePackingRequest;

export interface DeletePackingResponse {
  message: string;
}