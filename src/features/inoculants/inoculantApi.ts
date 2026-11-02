import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";
import type {
  Inoculant,
  CreateInoculantRequest,
  UpdateInoculantRequest,
  DeleteInoculantResponse,
} from "./inoculantTypes";

const BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1";

export const inoculantApi = createApi({
  reducerPath: "inoculantApi",

  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Inoculant"],

  endpoints: (builder) => ({
    getInoculants: builder.query<Inoculant[], void>({
      query: () => "/inoculants/",
      providesTags: ["Inoculant"],
    }),

    createInoculant: builder.mutation<Inoculant, CreateInoculantRequest>({
      query: (body) => ({ url: "/inoculants/", method: "POST", body }),
      invalidatesTags: ["Inoculant"],
    }),

    updateInoculant: builder.mutation<
      Inoculant,
      { id: number; body: UpdateInoculantRequest }
    >({
      query: ({ id, body }) => ({
        url: `/inoculants/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Inoculant"],
    }),

    deleteInoculant: builder.mutation<DeleteInoculantResponse, number>({
      query: (id) => ({ url: `/inoculants/${id}`, method: "DELETE" }),
      invalidatesTags: ["Inoculant"],
    }),
  }),
});

export const {
  useGetInoculantsQuery,
  useCreateInoculantMutation,
  useUpdateInoculantMutation,
  useDeleteInoculantMutation,
} = inoculantApi;