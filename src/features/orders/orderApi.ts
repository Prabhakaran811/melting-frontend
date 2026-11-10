import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { Order, CreateOrderRequest, UpdateOrderRequest } from "./orderTypes";

export const orderApi = createApi({
  reducerPath: "orderApi",

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

  tagTypes: ["Orders"],

  endpoints: (builder) => ({
    // GET ALL ORDERS
    getOrders: builder.query<Order[], void>({
      query: () => "/orders/",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Orders" as const,
                id,
              })),
              { type: "Orders" as const, id: "LIST" },
            ]
          : [{ type: "Orders" as const, id: "LIST" }],
    }),

    // GET ORDER BY ID (full Aim details)
    getOrderById: builder.query<Order, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Orders", id }],
    }),

    // CREATE ORDER (order number and status are set by the backend)
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (body) => ({
        url: "/orders/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Orders", id: "LIST" }],
    }),

    // UPDATE ORDER
    updateOrder: builder.mutation<Order, { id: number; body: UpdateOrderRequest }>({
      query: ({ id, body }) => ({
        url: `/orders/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Orders", id },
        { type: "Orders", id: "LIST" },
      ],
    }),

    // DELETE ORDER
    deleteOrder: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Orders", id },
        { type: "Orders", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = orderApi;