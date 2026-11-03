
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import { userApi } from "../features/users/userApi";
import { customerApi } from "../features/customers/customerApi";
import { supplierApi } from "../features/suppliers/supplierApi";
import { furnaceApi } from "../features/furnaces/furnaceApi";
import { productApi } from "../features/products/productApi";
import { hardnessApi } from "../features/hardness/hardnessApi";
import { inoculantApi } from "../features/inoculants/inoculantApi";
import { granuleApi } from "../features/fesiGranules/granuleApi";
import { packingApi } from "../features/packings/packingApi";
import { elementApi } from "../features/elements/elementApi";
export const store = configureStore({
  reducer: {
    auth: authReducer,
     [userApi.reducerPath]: userApi.reducer,
     [customerApi.reducerPath]: customerApi.reducer,
     [supplierApi.reducerPath]: supplierApi.reducer,
      [furnaceApi.reducerPath]: furnaceApi.reducer,
      [productApi.reducerPath]: productApi.reducer,
      [hardnessApi.reducerPath]: hardnessApi.reducer,
      [inoculantApi.reducerPath]: inoculantApi.reducer,
      [granuleApi.reducerPath]: granuleApi.reducer,
      [packingApi.reducerPath]: packingApi.reducer,
      [elementApi.reducerPath]: elementApi.reducer,
  },

   middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware()
    .concat(userApi.middleware)
    .concat(customerApi.middleware)
    .concat(supplierApi.middleware)
    .concat(furnaceApi.middleware)
    .concat(productApi.middleware)
    .concat(hardnessApi.middleware)
    .concat(inoculantApi.middleware)
    .concat(granuleApi.middleware)
    .concat(packingApi.middleware)
    .concat(elementApi.middleware),

});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
