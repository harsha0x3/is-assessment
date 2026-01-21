import { rootApiSlice } from "@/store/rootApiSlice";
import type { PriorityCountItem, DashboardStatsResponse } from "../types";

const dashboardApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStatsResponse, void>({
      query: () => `/dashboard/stats`,
    }),
    getPriorityWiseStats: builder.query<PriorityCountItem[], void>({
      query: () => `/dashboard/stats/priority-wise`,
    }),
  }),
});
export const { useGetDashboardStatsQuery, useGetPriorityWiseStatsQuery } =
  dashboardApiSlice;
