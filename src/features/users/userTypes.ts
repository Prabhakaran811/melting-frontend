
export type UserRole =
  | "admin"
  | "supervisor"
  | "operator"
  | "inspector";

export interface User {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  employee_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  phone_number?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface UserListParams {
  skip?: number;
  limit?: number;
}
