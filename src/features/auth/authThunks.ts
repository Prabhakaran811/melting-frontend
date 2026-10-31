
import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiRequest } from "../../services/api";

import type {
  LoginCredentials,
  LoginResponse,
  User,
} from "./authTypes";

// LOGIN
export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string }
>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiRequest<LoginResponse>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(credentials),
        }
      );

      sessionStorage.setItem(
        "access_token",
        response.access_token
      );

      sessionStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Login failed"
      );
    }
  }
);

// RESTORE SESSION
export const restoreSession = createAsyncThunk<
  { user: User; token: string },
  void,
  { rejectValue: string }
>(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      return rejectWithValue("No saved session");
    }

    try {
      const user = await apiRequest<User>(
        "/auth/me",
        { method: "GET" },
        token
      );

      sessionStorage.setItem("user", JSON.stringify(user));

      return { user, token };
    } catch {
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("user");

      return rejectWithValue("Session expired or invalid");
    }
  }
);
