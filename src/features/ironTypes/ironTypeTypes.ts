export interface IronTypeElement {
  id: number;
  name: string;
  abbreviation: string;
  sequence_order: number;
}

export interface IronType {
  id: number;
  name: string;
  elements: IronTypeElement[];
  created_at: string;
  updated_at: string;
}

export interface CreateIronTypeRequest {
  name: string;
  element_ids: number[];
}

export type UpdateIronTypeRequest = CreateIronTypeRequest;