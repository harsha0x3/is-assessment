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
} = execSummaryApiSlice;
