import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type { Wrapped, ReportData, ReportQueryArgs } from "./furnaceReportTypes";

// Works with both { success, data } and plain responses
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

export const furnaceReportApi = createApi({
  reducerPath: "furnaceReportApi",

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

  endpoints: (builder) => ({
    // FURNACE CYCLE REPORT (paged)
    getFurnaceCycleReports: builder.query<ReportData, ReportQueryArgs>({
      query: ({ page, page_size, from_date, to_date }) => {
        const params: Record<string, string | number> = { page, page_size };
        if (from_date) params.from_date = from_date;
        if (to_date) params.to_date = to_date;

        return { url: "/reports/furnace-cycles", params };
      },
      transformResponse: (res: Wrapped<ReportData> | ReportData) => unwrap(res),
    }),
  }),
});

export const { useGetFurnaceCycleReportsQuery } = furnaceReportApi;