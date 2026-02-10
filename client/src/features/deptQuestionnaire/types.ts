import type { UserOut } from "@/features/auth/types";

/** Answer */
export interface DeptAnswerOut {
  id: number;
  answer_text?: string | null;
  author?: UserOut | null;
}

/** Department Question (Template + App Answer) */
export interface DeptQuestionWithAnswer {
  id: number; // dept_question_id
  text: string;
  sequence_number?: number | null;
  is_mandatory: boolean;
  answer?: DeptAnswerOut | null;
}

/** Submit answer payload */
export interface AnswerSubmit {
  answer_text: string;
}
