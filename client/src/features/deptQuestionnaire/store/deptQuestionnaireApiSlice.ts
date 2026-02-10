// src\features\deptQuestionnaire\store\deptQuestionnireApiSlice.ts

import { rootApiSlice } from "@/store/rootApiSlice";
import type {
  AnswerSubmit,
  DeptAnswerOut,
  DeptQuestionWithAnswer,
} from "../types";
const deptQuestionnaireApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ➤ Get Questionnaire
    getDeptQuestionnaireWithAnswers: builder.query<
      DeptQuestionWithAnswer[],
      { appId: string; deptId: number }
    >({
      query: ({ appId, deptId }) =>
        `/dept-questionnaire/application/${appId}/department/${deptId}`,
      providesTags: (result, _e, { appId, deptId }) =>
        result
          ? [
              { type: "DeptQuestionnaire", id: `APP-${appId}-DEPT-${deptId}` },
              ...result.map((q) => ({
                type: "DeptQuestionnaire" as const,
                id: `QUESTION-${q.id}`,
              })),
            ]
          : [{ type: "DeptQuestionnaire", id: `APP-${appId}-DEPT-${deptId}` }],
    }),

    // ➤ Submit Answer
    submitAnswer: builder.mutation<
      DeptAnswerOut,
      {
        appId: string;
        deptQuestionId: number;
        answer: AnswerSubmit;
      }
    >({
      query: ({ appId, deptQuestionId, answer }) => ({
        url: `/dept-questionnaire/answer/application/${appId}/question/${deptQuestionId}`,
        method: "POST",
        body: answer,
      }),
      invalidatesTags: (_r, _e, { deptQuestionId }) => [
        { type: "DeptQuestionnaire", id: `QUESTION-${deptQuestionId}` },
      ],
    }),
  }),
});

export const {
  useGetDeptQuestionnaireWithAnswersQuery,
  useSubmitAnswerMutation,
} = deptQuestionnaireApiSlice;
