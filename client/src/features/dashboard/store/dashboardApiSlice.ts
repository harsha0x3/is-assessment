import { rootApiSlice } from "@/store/rootApiSlice";
import type {
  PriorityCountItem,
  VerticalStatusSummary,
  ApplicationStatusSummary,
  DepartmentSummaryResponse,
  DeptStatusCount,
  DepartmentCategorySummaryResponse,
  DepartmentStatusSummaryParams,
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
    getStatusPerDepartment: builder.query<
      DeptStatusCount[],
      { app_status: string; sla_filter?: number; dept_status: string }
    >({
      query: (params) => ({
        url: "/dashboard/summary/departments/status",
        method: "GET",
        params,
      }),
    }),

    getDepartmentSubcategory: builder.query<
      DepartmentCategorySummaryResponse,
      DepartmentStatusSummaryParams
    >({
      query: ({ app_status, dept_status, sla_filter, department_id }) => ({
        url: `/dashboard/summary/department/${department_id}/category`,
        params: {
          app_status,
          dept_status,
          ...(sla_filter ? { sla_filter } : {}),
        },
      }),
    }),
  }),
});
export const {
  useGetApplicationSummaryQuery,
  useGetDepartmentSummaryQuery,
  useGetPriorityWiseSummaryQuery,
  useGetVerticalWiseSummaryQuery,
  useGetStatusPerDepartmentQuery,
  useLazyGetDepartmentSubcategoryQuery,
} = dashboardApiSlice;
