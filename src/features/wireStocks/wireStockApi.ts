import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  WireStock,
  CreateWireStockRequest,
  UpdateWireStockRequest,
} from "./wireStockTypes";

export const wireStockApi = createApi({
  reducerPath: "wireStockApi",

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

  tagTypes: ["WireStocks"],

  endpoints: (builder) => ({
    // GET ALL WIRE STOCKS
    getWireStocks: builder.query<WireStock[], void>({
      query: () => "/wire-stocks/",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "WireStocks" as const,
                id,
              })),
              { type: "WireStocks" as const, id: "LIST" },
            ]
          : [{ type: "WireStocks" as const, id: "LIST" }],
    }),

    // CREATE WIRE STOCK
    createWireStock: builder.mutation<WireStock, CreateWireStockRequest>({
      query: (body) => ({
        url: "/wire-stocks/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "WireStocks", id: "LIST" }],
    }),

    // UPDATE WIRE STOCK
    updateWireStock: builder.mutation<
      WireStock,
      { id: number; body: UpdateWireStockRequest }
    >({
      query: ({ id, body }) => ({
        url: `/wire-stocks/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "WireStocks", id },
        { type: "WireStocks", id: "LIST" },
      ],
    }),

    // PERMANENT DELETE WIRE STOCK
    deleteWireStock: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/wire-stocks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "WireStocks", id },
        { type: "WireStocks", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetWireStocksQuery,
  useCreateWireStockMutation,
  useUpdateWireStockMutation,
  useDeleteWireStockMutation,
} = wireStockApi;