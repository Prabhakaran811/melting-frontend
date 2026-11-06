import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  RawMaterialStock,
  CreateRawMaterialStockRequest,
  UpdateRawMaterialStockRequest,
} from "./rawMaterialStockTypes";

export const rawMaterialStockApi = createApi({
  reducerPath: "rawMaterialStockApi",

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

  tagTypes: ["RawMaterialStocks"],

  endpoints: (builder) => ({
    // GET ALL RAW MATERIAL STOCKS
    getRawMaterialStocks: builder.query<RawMaterialStock[], void>({
      query: () => "/raw-material-stocks/",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "RawMaterialStocks" as const,
                id,
              })),
              { type: "RawMaterialStocks" as const, id: "LIST" },
            ]
          : [{ type: "RawMaterialStocks" as const, id: "LIST" }],
    }),

    // CREATE RAW MATERIAL STOCK
    createRawMaterialStock: builder.mutation<
      RawMaterialStock,
      CreateRawMaterialStockRequest
    >({
      query: (body) => ({
        url: "/raw-material-stocks/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RawMaterialStocks", id: "LIST" }],
    }),

    // UPDATE RAW MATERIAL STOCK
    updateRawMaterialStock: builder.mutation<
      RawMaterialStock,
      { id: number; body: UpdateRawMaterialStockRequest }
    >({
      query: ({ id, body }) => ({
        url: `/raw-material-stocks/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "RawMaterialStocks", id },
        { type: "RawMaterialStocks", id: "LIST" },
      ],
    }),

    // PERMANENT DELETE RAW MATERIAL STOCK
    deleteRawMaterialStock: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/raw-material-stocks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "RawMaterialStocks", id },
        { type: "RawMaterialStocks", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetRawMaterialStocksQuery,
  useCreateRawMaterialStockMutation,
  useUpdateRawMaterialStockMutation,
  useDeleteRawMaterialStockMutation,
} = rawMaterialStockApi;