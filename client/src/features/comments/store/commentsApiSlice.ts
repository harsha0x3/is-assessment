import { rootApiSlice } from "@/store/rootApiSlice";
import type { ApiResponse } from "@/store/rootTypes";
import type { CommentOut, NewCommentRequest } from "../types";
import type { EvidenceOut } from "@/features/evidences/types";

export interface CommentsWithEvidences extends CommentOut {
  evidences: EvidenceOut[];
}

const commentsApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ➤ Create Comment
    createComment: builder.mutation<
      ApiResponse<CommentsWithEvidences>,
      { appId: string; deptId: number; payload: FormData }
    >({
      query: ({ appId, deptId, payload }) => ({
        url: `/comments/application/${appId}/department/${deptId}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { appId, deptId }) => [
        { type: "Comments", id: `APP-${appId}` },
        { type: "Comments", id: `APP-${appId}-DEPT-${deptId}` },
        { type: "DepartmentInfo", id: `appId_${appId}-deptId_${deptId}` },
      ],
    }),

    // ➤ Update Comment
    updateComment: builder.mutation<
      ApiResponse<CommentsWithEvidences>,
      { commentId: string; payload: NewCommentRequest }
    >({
      query: ({ commentId, payload }) => ({
        url: `/comments/${commentId}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: (result) => [
        { type: "Comments", id: `APP-${result?.data?.application_id}` },
        {
          type: "Comments",
          id: `APP-${result?.data?.application_id}-DEPT-${result?.data?.department_id}`,
        },
        {
          type: "DepartmentInfo",
          id: `appId_${result?.data?.application_id}-deptId_${result?.data?.department_id}`,
        },
      ],
    }),

    // ➤ Get Comments for Application
    getCommentsForApplication: builder.query<
      ApiResponse<CommentsWithEvidences[]>,
      string
    >({
      query: (appId) => `/comments/application/${appId}`,
      providesTags: (_result, _error, appId) => [
        { type: "Comments", id: `APP-${appId}` },
      ],
    }),

    // ➤ Get Comments for a specific Department in an Application
    getCommentsForDepartment: builder.query<
      ApiResponse<CommentsWithEvidences[]>,
      { appId: string; deptId: number }
    >({
      query: ({ appId, deptId }) =>
        `/comments/application/${appId}/department/${deptId}`,
      providesTags: (_result, _error, { appId, deptId }) => [
        { type: "Comments", id: `APP-${appId}-DEPT-${deptId}` },
      ],
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useGetCommentsForApplicationQuery,
  useGetCommentsForDepartmentQuery,
} = commentsApiSlice;
