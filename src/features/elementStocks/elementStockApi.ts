import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  ElementStock,
  StockSupplier,
  CreateElementStockRequest,
  UpdateElementStockRequest,
} from "./elementStockTypes";

export const elementStockApi = createApi({
  reducerPath: "elementStockApi",

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

  tagTypes: ["ElementStocks"],

  endpoints: (builder) => ({
    // GET ALL ELEMENT STOCKS
    getElementStocks: builder.query<ElementStock[], void>({
      query: () => "/element-stocks/",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "ElementStocks" as const,
                id,
              })),
              { type: "ElementStocks" as const, id: "LIST" },
            ]
          : [{ type: "ElementStocks" as const, id: "LIST" }],
    }),

    // CREATE ELEMENT STOCK
    createElementStock: builder.mutation<ElementStock, CreateElementStockRequest>({
      query: (body) => ({
        url: "/element-stocks/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ElementStocks", id: "LIST" }],
    }),

    // UPDATE ELEMENT STOCK
    updateElementStock: builder.mutation<
      ElementStock,
      { id: number; body: UpdateElementStockRequest }
    >({
      query: ({ id, body }) => ({
        url: `/element-stocks/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ElementStocks", id },
        { type: "ElementStocks", id: "LIST" },
      ],
    }),

    // PERMANENT DELETE ELEMENT STOCK
    deleteElementStock: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/element-stocks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "ElementStocks", id },
        { type: "ElementStocks", id: "LIST" },
      ],
    }),

    // SUPPLIERS FOR THE DROPDOWN
    // If you already have a supplier API slice, you can use its hook instead.
    getSuppliers: builder.query<StockSupplier[], void>({
      query: () => "/suppliers/",
    }),
  }),
});

export const {
  useGetElementStocksQuery,
  useCreateElementStockMutation,
  useUpdateElementStockMutation,
  useDeleteElementStockMutation,
  useGetSuppliersQuery,
} = elementStockApi;