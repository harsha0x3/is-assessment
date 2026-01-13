import { rootApiSlice } from "@/store/rootApiSlice";
import type { DashboardStatsResponse } from "../types";

const dashboardApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStatsResponse, void>({
      query: () => `/dashboard/stats`,
    }),
  }),
});
export const { useGetDashboardStatsQuery } = dashboardApiSlice;
