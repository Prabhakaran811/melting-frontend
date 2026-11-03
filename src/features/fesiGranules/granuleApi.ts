import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";
import type {
  Granule,
  CreateGranuleRequest,
  UpdateGranuleRequest,
  DeleteGranuleResponse,
} from "./granuleTypes";

const BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1";

export const granuleApi = createApi({
  reducerPath: "granuleApi",

  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Granule"],

  endpoints: (builder) => ({
    getGranules: builder.query<Granule[], void>({
      query: () => "/fesi-granules/",
      providesTags: ["Granule"],
    }),

    createGranule: builder.mutation<Granule, CreateGranuleRequest>({
      query: (body) => ({ url: "/fesi-granules/", method: "POST", body }),
      invalidatesTags: ["Granule"],
    }),

    updateGranule: builder.mutation<
      Granule,
      { id: number; body: UpdateGranuleRequest }
    >({
      query: ({ id, body }) => ({
        url: `/fesi-granules/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Granule"],
    }),

    deleteGranule: builder.mutation<DeleteGranuleResponse, number>({
      query: (id) => ({ url: `/fesi-granules/${id}`, method: "DELETE" }),
      invalidatesTags: ["Granule"],
    }),
  }),
});

export const {
  useGetGranulesQuery,
  useCreateGranuleMutation,
  useUpdateGranuleMutation,
  useDeleteGranuleMutation,
} = granuleApi;