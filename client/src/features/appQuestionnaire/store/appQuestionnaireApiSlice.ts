import { rootApiSlice } from "@/store/rootApiSlice";
import type {
  AppQuestionSetOut,
  AppQuestionWithAnswer,
  AppAnswerOut,
  AppQuestionCreate,
  AppQuestion,
} from "../types";

const appQuestionnaireApiSlice = rootApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get a question set by id
    getQuestionSet: builder.query<AppQuestionSetOut[], number>({
      query: (questionSetId) => `/app-questions/set/${questionSetId}`,
      providesTags: (_result, _error, questionSetId) => [
        { type: "AppQuestionnaire" as const, id: `SET-${questionSetId}` },
      ],
    }),

    // Get questions for an application with their answers
    getQuestionsWithAnswers: builder.query<AppQuestionWithAnswer[], string>({
      query: (applicationId) => `/app-questions/application/${applicationId}`,
      providesTags: (_result, _error, applicationId) => [
        { type: "AppQuestionnaire" as const, id: `APP-${applicationId}` },
      ],
    }),

    // Submit an answer for an application question
    submitAnswer: builder.mutation<
      AppAnswerOut,
      {
        applicationId: string;
        payload: { app_question_id: number; answer_text: string };
      }
    >({
      query: ({ applicationId, payload }) => ({
        url: `/app-questions/answer/application/${applicationId}`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_r, _e, { applicationId }) => [
        { type: "AppQuestionnaire" as const, id: `APP-${applicationId}` },
      ],
    }),

    // Create a new question set
    createQuestionSet: builder.mutation<AppQuestionSetOut, { name: string }>({
      query: ({ name }) => ({
        url: `/app-questions/set`,
        method: "POST",
        body: name,
      }),
      invalidatesTags: [{ type: "AppQuestionnaire" as const, id: "LIST" }],
    }),

    // Add a single question to a set
    addQuestionToSet: builder.mutation<
      AppQuestion,
      { question_set_id: number; payload: AppQuestionCreate }
    >({
      query: ({ question_set_id, payload }) => ({
        url: `/app-questions/set/${question_set_id}/question`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_r, _e, { question_set_id }) => [
        { type: "AppQuestionnaire" as const, id: `SET-${question_set_id}` },
      ],
    }),

    // Add multiple questions to a set
    addQuestionsToSet: builder.mutation<
      AppQuestion[],
      { question_set_id: number; payload: AppQuestionCreate[] }
    >({
      query: ({ question_set_id, payload }) => ({
        url: `/app-questions/set/${question_set_id}/questions`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_r, _e, { question_set_id }) => [
        { type: "AppQuestionnaire" as const, id: `SET-${question_set_id}` },
      ],
    }),
  }),
});

export const {
  useGetQuestionSetQuery,
  useGetQuestionsWithAnswersQuery,
  useSubmitAnswerMutation,
  useCreateQuestionSetMutation,
  useAddQuestionToSetMutation,
  useAddQuestionsToSetMutation,
} = appQuestionnaireApiSlice;

export default appQuestionnaireApiSlice;
