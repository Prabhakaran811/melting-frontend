import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  Element,
  CreateElementRequest,
  UpdateElementRequest,
} from "./elementTypes";

export const elementApi = createApi({
  reducerPath: "elementApi",

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

  tagTypes: ["Elements"],

  endpoints: (builder) => ({
    // GET ALL ELEMENTS
    getElements: builder.query<Element[], void>({
      query: () => "/elements/",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Elements" as const,
                id,
              })),
              { type: "Elements" as const, id: "LIST" },
            ]
          : [{ type: "Elements" as const, id: "LIST" }],
    }),

    // CREATE ELEMENT
    createElement: builder.mutation<Element, CreateElementRequest>({
      query: (body) => ({
        url: "/elements/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Elements", id: "LIST" }],
    }),

    // UPDATE ELEMENT
    updateElement: builder.mutation<
      Element,
      { id: number; body: UpdateElementRequest }
    >({
      query: ({ id, body }) => ({
        url: `/elements/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Elements", id },
        { type: "Elements", id: "LIST" },
      ],
    }),

    // PERMANENT DELETE ELEMENT
    deleteElement: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/elements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Elements", id },
        { type: "Elements", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetElementsQuery,
  useCreateElementMutation,
  useUpdateElementMutation,
  useDeleteElementMutation,
} = elementApi;