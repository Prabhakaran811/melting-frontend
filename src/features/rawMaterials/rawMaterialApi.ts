import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  RawMaterial,
  CreateRawMaterialRequest,
  UpdateRawMaterialRequest,
} from "./rawMaterialTypes";

export const rawMaterialApi = createApi({
  reducerPath: "rawMaterialApi",

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

  tagTypes: ["RawMaterials"],

  endpoints: (builder) => ({
    // GET ALL RAW MATERIALS
    getRawMaterials: builder.query<RawMaterial[], void>({
      query: () => "/raw-materials/",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "RawMaterials" as const,
                id,
              })),
              { type: "RawMaterials" as const, id: "LIST" },
            ]
          : [{ type: "RawMaterials" as const, id: "LIST" }],
    }),

    // CREATE RAW MATERIAL
    createRawMaterial: builder.mutation<RawMaterial, CreateRawMaterialRequest>({
      query: (body) => ({
        url: "/raw-materials/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RawMaterials", id: "LIST" }],
    }),

    // UPDATE RAW MATERIAL
    updateRawMaterial: builder.mutation<
      RawMaterial,
      { id: number; body: UpdateRawMaterialRequest }
    >({
      query: ({ id, body }) => ({
        url: `/raw-materials/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "RawMaterials", id },
        { type: "RawMaterials", id: "LIST" },
      ],
    }),

    // PERMANENT DELETE RAW MATERIAL
    deleteRawMaterial: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/raw-materials/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "RawMaterials", id },
        { type: "RawMaterials", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetRawMaterialsQuery,
  useCreateRawMaterialMutation,
  useUpdateRawMaterialMutation,
  useDeleteRawMaterialMutation,
} = rawMaterialApi;