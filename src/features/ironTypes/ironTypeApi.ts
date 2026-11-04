import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  IronType,
  CreateIronTypeRequest,
  UpdateIronTypeRequest,
} from "./ironTypeTypes";

export const ironTypeApi = createApi({
  reducerPath: "ironTypeApi",

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

  tagTypes: ["IronTypes"],

  endpoints: (builder) => ({
    // GET ALL IRON TYPES
    getIronTypes: builder.query<IronType[], void>({
      query: () => "/iron-types/",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "IronTypes" as const,
                id,
              })),
              { type: "IronTypes" as const, id: "LIST" },
            ]
          : [{ type: "IronTypes" as const, id: "LIST" }],
    }),

    // CREATE IRON TYPE
    createIronType: builder.mutation<IronType, CreateIronTypeRequest>({
      query: (body) => ({
        url: "/iron-types/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "IronTypes", id: "LIST" }],
    }),

    // UPDATE IRON TYPE
    updateIronType: builder.mutation<
      IronType,
      { id: number; body: UpdateIronTypeRequest }
    >({
      query: ({ id, body }) => ({
        url: `/iron-types/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "IronTypes", id },
        { type: "IronTypes", id: "LIST" },
      ],
    }),

    // PERMANENT DELETE IRON TYPE
    deleteIronType: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/iron-types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "IronTypes", id },
        { type: "IronTypes", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetIronTypesQuery,
  useCreateIronTypeMutation,
  useUpdateIronTypeMutation,
  useDeleteIronTypeMutation,
} = ironTypeApi;