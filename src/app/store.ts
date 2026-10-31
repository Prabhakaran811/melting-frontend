
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import { userApi } from "../features/users/userApi";
import { customerApi } from "../features/customers/customerApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
     [userApi.reducerPath]: userApi.reducer,
     [customerApi.reducerPath]: customerApi.reducer,
  },

   middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware()
    .concat(userApi.middleware)
    .concat(customerApi.middleware),
   
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
