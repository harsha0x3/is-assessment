// src/features/deptQuestionnaire/types.ts

import type { UserOut } from "@/features/auth/types";

/** ➤ Link Question Payload */
export interface NewAppDeptLink {
  question_id: number;
  sequence_number?: number | null;
  is_default?: boolean;
}

/** ➤ Question */
export interface QuestionOut {
  id: number;
  text: string;
}

/** ➤ Answer */
export interface AnswerOut {
  id: number;
  app_dept_question_id: number;
  answer_text?: string | null;
  author?: UserOut | null;
}

export interface AnswerSubmit {
  answer_text: string;
}

/** ➤ App Department Question */
export interface AppDeptQuestionOut {
  id: number;
  application_id: string;
  department_id: number;
  question_id: number;
  sequence_number?: number | null;
  is_default: boolean;
  question: QuestionOut;
}

/** ➤ App Department Question with Answer */
export interface AppDeptQuestionWithAnswer extends AppDeptQuestionOut {
  answer?: AnswerOut | null;
}
