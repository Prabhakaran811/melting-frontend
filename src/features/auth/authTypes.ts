
export interface User {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: "admin" | "supervisor" | "operator" | "inspector";
  is_active: boolean;
}

export interface LoginCredentials {
  employee_id: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  isCheckingAuth: boolean;
}