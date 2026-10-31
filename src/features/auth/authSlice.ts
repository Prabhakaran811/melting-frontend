
import { createSlice } from "@reduxjs/toolkit";

import type { AuthState } from "./authTypes";
import {
  loginUser,
  restoreSession,
} from "./authThunks";

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
  isCheckingAuth: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearAuthError(state) {
      state.error = null;
    },

    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },

extraReducers: (builder) => {
  builder
    // LOGIN
    .addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.access_token;
      state.isAuthenticated = true;
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Login failed";
    })

    // RESTORE SESSION
    .addCase(restoreSession.pending, (state) => {
      state.isCheckingAuth = true;
    })
    .addCase(restoreSession.fulfilled, (state, action) => {
      state.isCheckingAuth = false;
      state.initialized = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.token;
      state.isAuthenticated = true;
    })
    .addCase(restoreSession.rejected, (state) => {
      state.isCheckingAuth = false;
      state.initialized = true;
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    });
},
});

export const { clearAuthError, clearAuth } = authSlice.actions;

export default authSlice.reducer;
