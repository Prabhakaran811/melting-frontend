import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../app/store";
import type {
  Furnace,
  CreateFurnaceRequest,
  UpdateFurnaceRequest,
  UpdateFurnaceStatusRequest,
} from "./furnaceTypes";

const BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1";

export const furnaceApi = createApi({
  reducerPath: "furnaceApi",

  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Furnace"],

  endpoints: (builder) => ({
    getFurnaces: builder.query<Furnace[], void>({
      query: () => "/furnaces/",
      providesTags: ["Furnace"],
    }),

    createFurnace: builder.mutation<Furnace, CreateFurnaceRequest>({
      query: (body) => ({ url: "/furnaces/", method: "POST", body }),
      invalidatesTags: ["Furnace"],
    }),

    updateFurnace: builder.mutation<
      Furnace,
      { id: number; body: UpdateFurnaceRequest }
    >({
      query: ({ id, body }) => ({
        url: `/furnaces/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Furnace"],
    }),

    updateFurnaceStatus: builder.mutation<
      Furnace,
      { id: number; body: UpdateFurnaceStatusRequest }
    >({
      query: ({ id, body }) => ({
        url: `/furnaces/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Furnace"],
    }),
  }),
});

export const {
  useGetFurnacesQuery,
  useCreateFurnaceMutation,
  useUpdateFurnaceMutation,
  useUpdateFurnaceStatusMutation,
} = furnaceApi;