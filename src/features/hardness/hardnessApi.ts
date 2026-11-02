import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";
import type {
  Hardness,
  CreateHardnessRequest,
  UpdateHardnessRequest,
  DeleteHardnessResponse,
} from "./hardnessTypes";

const BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1";

export const hardnessApi = createApi({
  reducerPath: "hardnessApi",

  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Hardness"],

  endpoints: (builder) => ({
    getHardnesses: builder.query<Hardness[], void>({
      query: () => "/hardnesses/",
      providesTags: ["Hardness"],
    }),

    createHardness: builder.mutation<Hardness, CreateHardnessRequest>({
      query: (body) => ({ url: "/hardnesses/", method: "POST", body }),
      invalidatesTags: ["Hardness"],
    }),

    updateHardness: builder.mutation<
      Hardness,
      { id: number; body: UpdateHardnessRequest }
    >({
      query: ({ id, body }) => ({
        url: `/hardnesses/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Hardness"],
    }),

    deleteHardness: builder.mutation<DeleteHardnessResponse, number>({
      query: (id) => ({ url: `/hardnesses/${id}`, method: "DELETE" }),
      invalidatesTags: ["Hardness"],
    }),
  }),
});

export const {
  useGetHardnessesQuery,
  useCreateHardnessMutation,
  useUpdateHardnessMutation,
  useDeleteHardnessMutation,
} = hardnessApi;