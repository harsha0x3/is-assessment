import type { UserOut } from "@/features/auth/types";

export interface AppQuestion {
  id: number;
  question_set_id: number;
  sequence_number: number | null;
  text: string;
  is_medium: boolean;
  is_high: boolean;
}

export interface AppAnswerOut {
  id: number;
  application_id: number;
  app_question_id: number;
  answer_text: string | null;
  author: UserOut | null;
}

export interface AppQuestionWithAnswer extends AppQuestion {
  answer: AppAnswerOut | null;
}

export interface AppQuestionsOut {
  questions: AppQuestion[];
  answers: AppAnswerOut[];
}

export interface AppQuestionSetOut {
  id: number;
  name: string;
  description: string | null;
  questions: AppQuestion[];
}

export interface AppQuestionCreate {
  text: string;
  is_medium?: boolean;
  is_high?: boolean;
  sequence_number: number | null;
  is_default?: boolean;
}

export interface AppAnswerInput {
  app_question_id: number;
  answer_text: string;
}
