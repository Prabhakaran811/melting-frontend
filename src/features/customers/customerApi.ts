import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "./customerTypes";

export const customerApi = createApi({
  reducerPath: "customerApi",

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

  tagTypes: ["Customers"],

  endpoints: (builder) => ({

    // GET ALL CUSTOMERS
    getCustomers: builder.query<Customer[], void>({
      query: () => "/customers/",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Customers" as const,
                id,
              })),
              { type: "Customers" as const, id: "LIST" },
            ]
          : [{ type: "Customers" as const, id: "LIST" }],
    }),

    // CREATE CUSTOMER
    createCustomer: builder.mutation<
      Customer,
      CreateCustomerRequest
    >({
      query: (body) => ({
        url: "/customers/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Customers", id: "LIST" }],
    }),

    // UPDATE CUSTOMER
    updateCustomer: builder.mutation<
      Customer,
      { id: number; body: UpdateCustomerRequest }
    >({
      query: ({ id, body }) => ({
        url: `/customers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Customers", id },
        { type: "Customers", id: "LIST" },
      ],
    }),

    // PERMANENT DELETE CUSTOMER
    deleteCustomer: builder.mutation<
      { message: string },
      number
    >({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Customers", id },
        { type: "Customers", id: "LIST" },
      ],
    }),

  }),
});

export const {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerApi;