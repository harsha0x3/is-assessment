// src\features\deptQuestionnaire\components\QuestionnaireList.tsx

import { useSelector } from "react-redux";
import { selectUserDepts } from "@/features/auth/store/authSlice";
import type { AppDeptQuestionWithAnswer } from "../types";
import QuestionItem from "./QuestionItem";

interface Props {
  appId: string;
  deptId: number;
  questions: AppDeptQuestionWithAnswer[];
}

const QuestionnaireList: React.FC<Props> = ({ deptId, questions }) => {
  const userDepts = useSelector(selectUserDepts);
  const canAnswer = userDepts.includes(deptId);

  if (questions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No questions configured for this department.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((q) => (
        <QuestionItem key={q.id} question={q} canAnswer={canAnswer} />
      ))}
    </div>
  );
};

export default QuestionnaireList;
