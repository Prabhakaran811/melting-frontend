import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  Aim,
  CreateAimRequest,
  UpdateAimRequest,
  LookupItem,
} from "./aimTypes";

export const aimApi = createApi({
  reducerPath: "aimApi",

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

  tagTypes: ["Aims"],

  endpoints: (builder) => ({
    // GET ALL AIMS
    getAims: builder.query<Aim[], void>({
      query: () => "/aims/",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Aims" as const,
                id,
              })),
              { type: "Aims" as const, id: "LIST" },
            ]
          : [{ type: "Aims" as const, id: "LIST" }],
    }),

    // CREATE AIM
    createAim: builder.mutation<Aim, CreateAimRequest>({
      query: (body) => ({
        url: "/aims/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Aims", id: "LIST" }],
    }),

    // UPDATE AIM
    updateAim: builder.mutation<Aim, { id: number; body: UpdateAimRequest }>({
      query: ({ id, body }) => ({
        url: `/aims/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Aims", id },
        { type: "Aims", id: "LIST" },
      ],
    }),

    // PERMANENT DELETE AIM
    deleteAim: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/aims/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Aims", id },
        { type: "Aims", id: "LIST" },
      ],
    }),

    // ---------- Dropdown lists ----------
    // If you already have API slices for these masters, you can use their hooks instead.
    getCustomers: builder.query<LookupItem[], void>({ query: () => "/customers/" }),
    getProducts: builder.query<LookupItem[], void>({ query: () => "/products/" }),
    getPackings: builder.query<LookupItem[], void>({ query: () => "/packings/" }),
    getHardnesses: builder.query<LookupItem[], void>({ query: () => "/hardnesses/" }),
    getInoculants: builder.query<LookupItem[], void>({ query: () => "/inoculants/" }),
  }),
});

export const {
  useGetAimsQuery,
  useCreateAimMutation,
  useUpdateAimMutation,
  useDeleteAimMutation,
  useGetCustomersQuery,
  useGetProductsQuery,
  useGetPackingsQuery,
  useGetHardnessesQuery,
  useGetInoculantsQuery,
} = aimApi;