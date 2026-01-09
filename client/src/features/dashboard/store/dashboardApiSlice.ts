import { rootApiSlice } from "@/store/rootApiSlice";
import type { ApiResponse } from "@/store/rootTypes";
import type { DashboardStats } from "../types";

const dashboardApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOverallStats: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => `/dashboard/overall`,
    }),
  }),
});
export const { useGetOverallStatsQuery } = dashboardApiSlice;
