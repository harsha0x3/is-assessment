import { rootApiSlice } from "@/store/rootApiSlice";
import type {
  PriorityCountItem,
  DashboardSummaryResponse,
  VerticalStatusSummary,
} from "../types";

const dashboardApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummaryResponse, void>({
      query: () => `/dashboard/summary`,
    }),
    getPriorityWiseSummary: builder.query<PriorityCountItem[], void>({
      query: () => `/dashboard/summary/priority-wise`,
    }),
    getVerticalWiseSummary: builder.query<VerticalStatusSummary[], void>({
      query: () => `/dashboard/summary/vertical-wise`,
    }),
  }),
});
export const {
  useGetDashboardSummaryQuery,
  useGetPriorityWiseSummaryQuery,
  useGetVerticalWiseSummaryQuery,
} = dashboardApiSlice;
