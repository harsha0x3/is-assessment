import { rootApiSlice } from "@/store/rootApiSlice";
import type { ExecSummaryOut, NewExecSummaryRequest } from "../types";

export const execSummaryApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // -------- GET ALL BY APPLICATION --------
    getExecSummariesByApp: builder.query<ExecSummaryOut[], string>({
      query: (appId) => ({
        url: `/exec_summary/application/${appId}`,
        method: "GET",
      }),
      providesTags: ["ExecSummary"],
    }),

    getExecSummariesByDept: builder.query<
      ExecSummaryOut[],
      { appId: string; deptId: number }
    >({
      query: ({ appId, deptId }) => ({
        url: `/exec_summary/application/${appId}/department/${deptId}`,
        method: "GET",
      }),
      providesTags: ["DeptExecSummary"],
    }),

    // -------- GET LATEST BY APPLICATION --------
    getLatestExecSummary: builder.query<ExecSummaryOut, string>({
      query: (appId) => ({
        url: `/exec_summary/application/${appId}/latest`,
        method: "GET",
      }),
      providesTags: ["ExecSummary"],
    }),

    // -------- CREATE --------
    createExecSummary: builder.mutation<
      ExecSummaryOut,
      { appId: string; body: NewExecSummaryRequest }
    >({
      query: ({ appId, body }) => ({
        url: `/exec_summary/application/${appId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ExecSummary"],
    }),

    createDeptExecSummary: builder.mutation<
      ExecSummaryOut,
      { appId: string; deptId: number; body: NewExecSummaryRequest }
    >({
      query: ({ appId, deptId, body }) => ({
        url: `/exec_summary/application/${appId}/department/${deptId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["DeptExecSummary"],
    }),

    // -------- UPDATE --------
    updateExecSummary: builder.mutation<
      ExecSummaryOut,
      { summaryId: string; body: NewExecSummaryRequest }
    >({
      query: ({ summaryId, body }) => ({
        url: `/exec_summary/${summaryId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ExecSummary"],
    }),
  }),
});

export const {
  useGetExecSummariesByAppQuery,
  useGetLatestExecSummaryQuery,
  useCreateExecSummaryMutation,
  useUpdateExecSummaryMutation,
  useGetExecSummariesByDeptQuery,
  useCreateDeptExecSummaryMutation,
} = execSummaryApiSlice;
