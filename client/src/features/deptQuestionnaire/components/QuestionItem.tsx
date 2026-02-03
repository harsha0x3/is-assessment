// src\features\deptQuestionnaire\componenets\QuestionItem.tsx

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X, Loader } from "lucide-react";
import Hint from "@/components/ui/hint";
import { toast } from "sonner";
import type { AppDeptQuestionWithAnswer } from "../types";
import { useSubmitAnswerMutation } from "../store/deptQuestionnaireApiSlice";
import { getApiErrorMessage } from "@/utils/handleApiError";

interface Props {
  question: AppDeptQuestionWithAnswer;
  canAnswer: boolean;
}

const QuestionItem: React.FC<Props> = ({ question, canAnswer }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [answerText, setAnswerText] = useState(
    question.answer?.answer_text ?? "",
  );

  const [submitAnswer, { isLoading }] = useSubmitAnswerMutation();

  const handleSave = async () => {
    try {
      await submitAnswer({
        appDeptQuestionId: question.id,
        answer: { answer_text: answerText },
      }).unwrap();

      setIsEditing(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err) ?? "Failed to save answer");
    }
  };

  return (
    <Card className="p-4 space-y-2 gap-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">
            Q{question.sequence_number}
          </p>
          <p className="font-medium">{question.question.text}</p>
        </div>

        {canAnswer && !isEditing && (
          <Hint label="Edit answer">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </Hint>
        )}
      </div>

      {!isEditing ? (
        <p className="text-sm whitespace-pre-wrap">
          {question.answer?.answer_text ? (
            question.answer.answer_text
          ) : (
            <span className="text-muted-foreground italic">
              No answer provided
            </span>
          )}
        </p>
      ) : (
        <>
          <Textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            className="min-h-20"
          />

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <Loader className="animate-spin h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="text-red-500"
              onClick={() => {
                setIsEditing(false);
                setAnswerText(question.answer?.answer_text ?? "");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default QuestionItem;
