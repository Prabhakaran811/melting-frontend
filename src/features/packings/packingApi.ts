import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";
import type {
  Packing,
  CreatePackingRequest,
  UpdatePackingRequest,
  DeletePackingResponse,
} from "./packingTypes";

const BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1";

export const packingApi = createApi({
  reducerPath: "packingApi",

  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Packing"],

  endpoints: (builder) => ({
    getPackings: builder.query<Packing[], void>({
      query: () => "/packings/",
      providesTags: ["Packing"],
    }),

    createPacking: builder.mutation<Packing, CreatePackingRequest>({
      query: (body) => ({ url: "/packings/", method: "POST", body }),
      invalidatesTags: ["Packing"],
    }),

    updatePacking: builder.mutation<
      Packing,
      { id: number; body: UpdatePackingRequest }
    >({
      query: ({ id, body }) => ({
        url: `/packings/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Packing"],
    }),

    deletePacking: builder.mutation<DeletePackingResponse, number>({
      query: (id) => ({ url: `/packings/${id}`, method: "DELETE" }),
      invalidatesTags: ["Packing"],
    }),
  }),
});

export const {
  useGetPackingsQuery,
  useCreatePackingMutation,
  useUpdatePackingMutation,
  useDeletePackingMutation,
} = packingApi;