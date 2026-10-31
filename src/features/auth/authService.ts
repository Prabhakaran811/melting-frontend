
import { apiRequest } from "../../services/api";
import type { LoginRequest, LoginResponse } from "./authTypes";

export async function login(
  credentials: LoginRequest
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function getCurrentUser(token: string) {
  return apiRequest("/auth/me", {
    method: "GET",
  }, token);
}

export async function logout(token: string): Promise<void> {
  await apiRequest("/auth/logout", {
    method: "POST",
  }, token);
}
