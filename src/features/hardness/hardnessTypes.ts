export interface Hardness {
  id: number;
  hardness_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHardnessRequest {
  hardness_name: string;
}

export type UpdateHardnessRequest = CreateHardnessRequest;

export interface DeleteHardnessResponse {
  message: string;
}