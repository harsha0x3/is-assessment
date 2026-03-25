import { rootApiSlice } from "@/store/rootApiSlice";
import type {
  PriorityCountItem,
  VerticalStatusSummary,
  ApplicationStatusSummary,
  DepartmentSummaryResponse,
  DeptStatusCount,
  DepartmentCategorySummaryResponse,
  DepartmentStatusSummaryParams,
  AppSummaryQueryParams,
  DeptSummaryQueryParams,
  ApptypeSummaryParams,
  AppTypeSummary,
  AppCompletionSummary,
} from "../types";

const dashboardApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getApplicationSummary: builder.query<
      ApplicationStatusSummary,
      AppSummaryQueryParams | void
    >({
      query: (params) => ({
        url: `/dashboard/summary/applications`,
        method: "GET",
        params: params ?? undefined,
      }),
    }),
    getDepartmentSummary: builder.query<
      DepartmentSummaryResponse,
      DeptSummaryQueryParams | void
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
      {
        app_status: string;
        app_age_from?: string;
        dept_status: string;
        app_age_to?: string;
        severity?: string;
        priority?: string;
      }
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

    getApptypeSummary: builder.query<AppTypeSummary[], ApptypeSummaryParams>({
      query: (params) => ({
        url: `/dashboard/summary/app_type`,
        params: params,
      }),
    }),

    getVAPTSummaryPerStatus: builder.query({
      query: () => `/dashboard/summary/vapt`,
    }),
    getAppCompletionSummary: builder.query<AppCompletionSummary[], void>({
      query: () => `/dashboard/summary/completion`,
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
  useLazyGetStatusPerDepartmentQuery,
  useGetApptypeSummaryQuery,
  useGetVAPTSummaryPerStatusQuery,
  useGetAppCompletionSummaryQuery,
} = dashboardApiSlice;
