import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  Wrapped,
  Furnace,
  FurnaceCycle,
  FurnaceDetails,
  SpectrumComparison,
  CreateChargeMixRequest,
  UpdateChargeMixRequest,
} from "./furnaceDashboardTypes";

// Works with both response styles:
//   { success: true, data: ... }   (wrapped)
//   [ ... ] or { ... }             (plain)
function unwrap<T>(res: Wrapped<T> | T): T {
  if (
    res !== null &&
    typeof res === "object" &&
    !Array.isArray(res) &&
    "success" in res &&
    "data" in res
  ) {
    return (res as Wrapped<T>).data;
  }
  return res as T;
}

const refresh = (furnaceId: number) => [
  { type: "FurnaceDetails" as const, id: furnaceId },
  { type: "Furnaces" as const, id: "LIST" },
];

export const furnaceDashboardApi = createApi({
  reducerPath: "furnaceDashboardApi",

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

  tagTypes: ["Furnaces", "FurnaceDetails"],

  endpoints: (builder) => ({
    // GET ALL FURNACES
    getFurnaces: builder.query<Furnace[], void>({
      query: () => "/furnaces/",
      transformResponse: (res: Wrapped<Furnace[]> | Furnace[]) => unwrap(res) ?? [],
      providesTags: [{ type: "Furnaces", id: "LIST" }],
    }),

    // GET CURRENT FURNACE DETAILS (cycle, order, charge mix, spectrum results)
    getFurnaceDetails: builder.query<FurnaceDetails, number>({
      query: (furnaceId) => `/furnaces/${furnaceId}/details`,
      transformResponse: (res: Wrapped<FurnaceDetails> | FurnaceDetails) => unwrap(res),
      providesTags: (_r, _e, furnaceId) => [{ type: "FurnaceDetails", id: furnaceId }],
    }),

    // COMPARE AIM AND SPECTRUM
    getSpectrumComparison: builder.query<
      SpectrumComparison,
      { furnaceId: number; cycleId: number }
    >({
      query: ({ furnaceId, cycleId }) =>
        `/furnaces/${furnaceId}/cycles/${cycleId}/spectrum-comparison`,
      transformResponse: (res: Wrapped<SpectrumComparison> | SpectrumComparison) => unwrap(res),
      providesTags: (_r, _e, { furnaceId }) => [{ type: "FurnaceDetails", id: furnaceId }],
    }),

    // START A NEW CYCLE
    startCycle: builder.mutation<FurnaceCycle, { furnaceId: number; order_id: number }>({
      query: ({ furnaceId, order_id }) => ({
        url: `/furnaces/${furnaceId}/cycles`,
        method: "POST",
        body: { order_id },
      }),
      transformResponse: (res: Wrapped<FurnaceCycle> | FurnaceCycle) => unwrap(res),
      invalidatesTags: (_r, _e, { furnaceId }) => refresh(furnaceId),
    }),

    // UPDATE ACTIVE STAGE
    updateStage: builder.mutation<
      unknown,
      { furnaceId: number; cycleId: number; active_stage: string }
    >({
      query: ({ furnaceId, cycleId, active_stage }) => ({
        url: `/furnaces/${furnaceId}/cycles/${cycleId}/stage`,
        method: "PATCH",
        body: { active_stage },
      }),
      invalidatesTags: (_r, _e, { furnaceId }) => refresh(furnaceId),
    }),

    // CREATE CHARGE MIX
    createChargeMix: builder.mutation<
      unknown,
      { furnaceId: number; cycleId: number; body: CreateChargeMixRequest }
    >({
      query: ({ furnaceId,  body }) => ({
        url: `/furnaces/${furnaceId}/charge-mix/items`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { furnaceId }) => refresh(furnaceId),
    }),

    // UPDATE DRAFT CHARGE MIX (replaces the items)
    updateChargeMix: builder.mutation<
      unknown,
      { furnaceId: number; cycleId: number; body: UpdateChargeMixRequest }
    >({
      query: ({ furnaceId,  body }) => ({
        url: `/furnaces/${furnaceId}/charge-mix/items`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { furnaceId }) => refresh(furnaceId),
    }),

    // CONFIRM CHARGE MIX
    confirmChargeMix: builder.mutation<unknown, { furnaceId: number; cycleId: number }>({
      query: ({ furnaceId }) => ({
        url: `/furnaces/${furnaceId}/charge-mix/confirm`,
        method: "PATCH",
      }),
      invalidatesTags: (_r, _e, { furnaceId }) => refresh(furnaceId),
    }),

    // COMPLETE THE MELT
    completeCycle: builder.mutation<
      unknown,
      { furnaceId: number; cycleId: number; remarks: string }
    >({
      query: ({ furnaceId, cycleId, remarks }) => ({
        url: `/furnaces/${furnaceId}/cycles/${cycleId}/complete`,
        method: "POST",
        body: { remarks },
      }),
      invalidatesTags: (_r, _e, { furnaceId }) => refresh(furnaceId),
    }),
  }),
});

export const {
  useGetFurnacesQuery,
  useGetFurnaceDetailsQuery,
  useGetSpectrumComparisonQuery,
  useStartCycleMutation,
  useUpdateStageMutation,
  useCreateChargeMixMutation,
  useUpdateChargeMixMutation,
  useConfirmChargeMixMutation,
  useCompleteCycleMutation,
} = furnaceDashboardApi;