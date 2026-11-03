export interface Granule {
  id: number;
  name: string;
}

export interface CreateGranuleRequest {
  name: string;
}

export type UpdateGranuleRequest = CreateGranuleRequest;

export interface DeleteGranuleResponse {
  message: string;
}