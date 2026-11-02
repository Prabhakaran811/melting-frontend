
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import { userApi } from "../features/users/userApi";
import { customerApi } from "../features/customers/customerApi";
import { supplierApi } from "../features/suppliers/supplierApi";
import { furnaceApi } from "../features/furnaces/furnaceApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
     [userApi.reducerPath]: userApi.reducer,
     [customerApi.reducerPath]: customerApi.reducer,
     [supplierApi.reducerPath]: supplierApi.reducer,
      [furnaceApi.reducerPath]: furnaceApi.reducer,
  },

   middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware()
    .concat(userApi.middleware)
    .concat(customerApi.middleware)
    .concat(supplierApi.middleware)
    .concat(furnaceApi.middleware),
   
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
