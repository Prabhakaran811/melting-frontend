import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { Wire, CreateWireRequest, UpdateWireRequest } from "./wireTypes";

export const wireApi = createApi({
  reducerPath: "wireApi",

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

  tagTypes: ["Wires"],

  endpoints: (builder) => ({
    // GET ALL WIRES
    getWires: builder.query<Wire[], void>({
      query: () => "/wires/",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Wires" as const,
                id,
              })),
              { type: "Wires" as const, id: "LIST" },
            ]
          : [{ type: "Wires" as const, id: "LIST" }],
    }),

    // CREATE WIRE
    createWire: builder.mutation<Wire, CreateWireRequest>({
      query: (body) => ({
        url: "/wires/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Wires", id: "LIST" }],
    }),

    // UPDATE WIRE
    updateWire: builder.mutation<Wire, { id: number; body: UpdateWireRequest }>({
      query: ({ id, body }) => ({
        url: `/wires/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Wires", id },
        { type: "Wires", id: "LIST" },
      ],
    }),

    // PERMANENT DELETE WIRE
    deleteWire: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/wires/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Wires", id },
        { type: "Wires", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetWiresQuery,
  useCreateWireMutation,
  useUpdateWireMutation,
  useDeleteWireMutation,
} = wireApi;