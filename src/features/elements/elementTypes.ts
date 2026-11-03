export interface Element {
  id: number;
  name: string;
  abbreviation: string;
  sequence_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateElementRequest {
  name: string;
  abbreviation: string;
  sequence_order: number;
}

export type UpdateElementRequest = CreateElementRequest;

// Kept so ElementForm.tsx works without changes
export type ElementPayload = CreateElementRequest;