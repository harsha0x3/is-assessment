// src\features\deptQuestionnaire\components\QuestionnaireList.tsx

import { useSelector } from "react-redux";
import { selectUserDepts } from "@/features/auth/store/authSlice";

import QuestionItem from "./QuestionItem";
import type { DeptQuestionWithAnswer } from "../types";

interface Props {
  appId: string;
  deptId: number;
  questions: DeptQuestionWithAnswer[];
}

const QuestionnaireList: React.FC<Props> = ({ deptId, questions, appId }) => {
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
        <QuestionItem
          key={q.id}
          question={q}
          canAnswer={canAnswer}
          appId={appId}
        />
      ))}
    </div>
  );
};

export default QuestionnaireList;
