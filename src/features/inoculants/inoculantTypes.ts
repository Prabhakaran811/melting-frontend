export interface Inoculant {
  id: number;
  name: string;
}

export interface CreateInoculantRequest {
  name: string;
}

export type UpdateInoculantRequest = CreateInoculantRequest;

export interface DeleteInoculantResponse {
  message: string;
}