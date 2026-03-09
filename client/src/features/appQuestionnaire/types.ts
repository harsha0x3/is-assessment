import type { UserOut } from "@/features/auth/types";

export interface AppAnswerOut {
  id: number;
  application_id: string;
  app_question_id: number;
  answer_option_id: number | null;
  author: UserOut | null;
}

export interface AppQuestionOption {
  id: number;
  text: string;
  description?: string | null;
  weight: number;
}

export interface AppQuestion {
  id: number;
  question_set_id: number;
  sequence_number: number | null;
  text: string;
  is_medium: boolean;
  is_high: boolean;
  options: AppQuestionOption[];
}

export interface AppAnswerInput {
  app_question_id: number;
  answer_option_id: number;
}

export interface BulkAnswerInput {
  answers: AppAnswerInput[];
}

export interface AppQuestionWithAnswer extends AppQuestion {
  answer: {
    answer_option_id: number | null;
  } | null;
}

export interface AppAnswerOut {
  id: number;
  application_id: string;
  app_question_id: number;
  answer_option_id: number | null;
  author: UserOut | null;
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
