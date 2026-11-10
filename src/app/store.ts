
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
import { ironTypeApi } from "../features/ironTypes/ironTypeApi";
import { rawMaterialApi } from "../features/rawMaterials/rawMaterialApi";
import { wireApi } from "../features/wires/wireApi";
import { elementStockApi } from "../features/elementStocks/elementStockApi";
import { rawMaterialStockApi } from "../features/rawMaterialStocks/rawMaterialStockApi";
import { wireStockApi } from "../features/wireStocks/wireStockApi";
import { aimApi } from "../features/aims/aimApi";
import { orderApi } from "../features/orders/orderApi";

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
      [ironTypeApi.reducerPath]: ironTypeApi.reducer,
      [rawMaterialApi.reducerPath]: rawMaterialApi.reducer,
      [wireApi.reducerPath]: wireApi.reducer,
      [elementStockApi.reducerPath]: elementStockApi.reducer,
      [rawMaterialStockApi.reducerPath]: rawMaterialStockApi.reducer,
      [wireStockApi.reducerPath]: wireStockApi.reducer,
      [aimApi.reducerPath]: aimApi.reducer,
      [orderApi.reducerPath]: orderApi.reducer,
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
    .concat(elementApi.middleware)
    .concat(ironTypeApi.middleware)
    .concat(rawMaterialApi.middleware)
    .concat(wireApi.middleware)
    .concat(elementStockApi.middleware)
    .concat(rawMaterialStockApi.middleware)
    .concat(wireStockApi.middleware)
    .concat(aimApi.middleware)
    .concat(orderApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
