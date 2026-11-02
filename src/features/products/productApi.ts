import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  DeleteProductResponse,
} from "./productTypes";

const BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1";

export const productApi = createApi({
  reducerPath: "productApi",

  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Product"],

  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => "/products/",
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation<Product, CreateProductRequest>({
      query: (body) => ({ url: "/products/", method: "POST", body }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation<
      Product,
      { id: number; body: UpdateProductRequest }
    >({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Product"],
    }),

    deleteProduct: builder.mutation<DeleteProductResponse, number>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;