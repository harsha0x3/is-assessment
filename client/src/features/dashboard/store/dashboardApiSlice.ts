import { rootApiSlice } from "@/store/rootApiSlice";
import type {
  PriorityCountItem,
  VerticalStatusSummary,
  ApplicationStatusSummary,
  DepartmentSummaryResponse,
} from "../types";

const dashboardApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getApplicationSummary: builder.query<ApplicationStatusSummary, void>({
      query: () => `/dashboard/summary/applications`,
    }),
    getDepartmentSummary: builder.query<
      DepartmentSummaryResponse,
      { status_filter?: string; sla_filter?: number } | void
    >({
      query: (params) => ({
        url: `/dashboard/summary/departments`,
        method: "GET",
        params: params ?? undefined,
      }),
    }),
    getPriorityWiseSummary: builder.query<
      PriorityCountItem[],
      { status_filter?: string }
    >({
      query: (params) => ({
        url: `/dashboard/summary/priority-wise`,
        method: "GET",
        params: params,
      }),
    }),
    getVerticalWiseSummary: builder.query<VerticalStatusSummary[], void>({
      query: () => `/dashboard/summary/vertical-wise`,
    }),
  }),
});
export const {
  useGetApplicationSummaryQuery,
  useGetDepartmentSummaryQuery,
  useGetPriorityWiseSummaryQuery,
  useGetVerticalWiseSummaryQuery,
} = dashboardApiSlice;
