import { rootApiSlice } from "@/store/rootApiSlice";
import type { ApiResponse } from "@/store/rootTypes";
import type { EvidenceOut } from "../types";

const evidencesApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addDeptEvidence: builder.mutation<
      ApiResponse<unknown>,
      { appId: string; deptId: string; payload: FormData }
    >({
      query: ({ appId, deptId, payload }) => ({
        url: `evidences/application/${appId}/department/${deptId}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Evidences"],
    }),
    addAppEvidence: builder.mutation<
      ApiResponse<unknown>,
      { appId: string; payload: FormData }
    >({
      query: ({ appId, payload }) => ({
        url: `evidences/application/${appId}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Evidences"],
    }),

    getAppEvidences: builder.query<
      ApiResponse<EvidenceOut[]>,
      { appId: string }
    >({
      query: ({ appId }) => `evidences/application/${appId}`,
      providesTags: ["Evidences"],
    }),

    getDepartmentEvidences: builder.query<
      ApiResponse<EvidenceOut[]>,
      { appId: string; deptId: string }
    >({
      query: ({ appId, deptId }) =>
        `evidences/application/${appId}/department/${deptId}`,
      providesTags: ["Evidences"],
    }),
  }),
});

export const {
  useAddAppEvidenceMutation,
  useGetAppEvidencesQuery,
  useGetDepartmentEvidencesQuery,
  useAddDeptEvidenceMutation,
} = evidencesApiSlice;
