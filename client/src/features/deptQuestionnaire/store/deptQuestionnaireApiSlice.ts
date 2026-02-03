// src\features\deptQuestionnaire\store\deptQuestionnireApiSlice.ts

import { rootApiSlice } from "@/store/rootApiSlice";
import type {
  AppDeptQuestionWithAnswer,
  NewAppDeptLink,
  QuestionOut,
  AnswerOut,
  AnswerSubmit,
} from "../types";

const deptQuestionnaireApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ➤ Create Question
    createQuestion: builder.mutation<QuestionOut, { text: string }>({
      query: ({ text }) => ({
        url: "/dept-questionnaire",
        method: "POST",
        body: text,
      }),
      invalidatesTags: ["DeptQuestionnaire"],
    }),

    // ➤ Link Questions to Application Department
    linkQuestionsToDepartment: builder.mutation<
      AppDeptQuestionWithAnswer[],
      {
        appId: string;
        deptId: number;
        payload: NewAppDeptLink[];
      }
    >({
      query: ({ appId, deptId, payload }) => ({
        url: `/dept-questionnaire/link/application/${appId}/department/${deptId}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_r, _e, { appId, deptId }) => [
        { type: "DeptQuestionnaire", id: `APP-${appId}-DEPT-${deptId}` },
      ],
    }),

    // ➤ Get Questionnaire with Answers
    getDeptQuestionnaireWithAnswers: builder.query<
      AppDeptQuestionWithAnswer[],
      { appId: string; deptId: number }
    >({
      query: ({ appId, deptId }) =>
        `/dept-questionnaire/application/${appId}/department/${deptId}`,
      providesTags: (result, _e, { appId, deptId }) =>
        result
          ? [
              // Whole questionnaire tag
              { type: "DeptQuestionnaire", id: `APP-${appId}-DEPT-${deptId}` },

              // 🔥 One tag per question
              ...result.map((q) => ({
                type: "DeptQuestionnaire" as const,
                id: `QUESTION-${q.id}`,
              })),
            ]
          : [{ type: "DeptQuestionnaire", id: `APP-${appId}-DEPT-${deptId}` }],
    }),

    // ➤ Submit Answer
    submitAnswer: builder.mutation<
      AnswerOut,
      { appDeptQuestionId: number; answer: AnswerSubmit }
    >({
      query: ({ appDeptQuestionId, answer }) => ({
        url: `/dept-questionnaire/answer/${appDeptQuestionId}`,
        method: "POST",
        body: answer,
      }),
      invalidatesTags: (_r, _e, { appDeptQuestionId }) => [
        { type: "DeptQuestionnaire", id: `QUESTION-${appDeptQuestionId}` },
      ],
    }),
  }),
});

export const {
  useCreateQuestionMutation,
  useLinkQuestionsToDepartmentMutation,
  useGetDeptQuestionnaireWithAnswersQuery,
  useSubmitAnswerMutation,
} = deptQuestionnaireApiSlice;
