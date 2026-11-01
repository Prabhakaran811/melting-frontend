import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from "./supplierTypes";

export const supplierApi = createApi({
  reducerPath: "supplierApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",

    prepareHeaders: (headers) => {
      const token = sessionStorage.getItem("access_token");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["Suppliers"],

  endpoints: (builder) => ({
    // GET ALL SUPPLIERS
    getSuppliers: builder.query<Supplier[], void>({
      query: () => "/suppliers/",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Suppliers" as const,
                id,
              })),
              { type: "Suppliers" as const, id: "LIST" },
            ]
          : [{ type: "Suppliers" as const, id: "LIST" }],
    }),

    // CREATE SUPPLIER
    createSupplier: builder.mutation<Supplier, CreateSupplierRequest>({
      query: (body) => ({
        url: "/suppliers/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Suppliers", id: "LIST" }],
    }),

    // UPDATE SUPPLIER
    updateSupplier: builder.mutation<
      Supplier,
      { id: number; body: UpdateSupplierRequest }
    >({
      query: ({ id, body }) => ({
        url: `/suppliers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Suppliers", id },
        { type: "Suppliers", id: "LIST" },
      ],
    }),

    // DELETE SUPPLIER
    deleteSupplier: builder.mutation<{ message: string } | void, number>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Suppliers", id },
        { type: "Suppliers", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApi;