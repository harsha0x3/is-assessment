import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X, Loader } from "lucide-react";
import Hint from "@/components/ui/hint";
import { toast } from "sonner";
import type { AppQuestionWithAnswer } from "../types";
import { useSubmitAnswerMutation } from "../store/appQuestionnaireApiSlice";
import { getApiErrorMessage } from "@/utils/handleApiError";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  question: AppQuestionWithAnswer;
  canAnswer: boolean;
  applicationId: string;
}

const AppQuestionItem: React.FC<Props> = ({
  question,
  canAnswer,
  applicationId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [answerText, setAnswerText] = useState(
    question.answer?.answer_text ?? "",
  );

  const [submitAnswer, { isLoading }] = useSubmitAnswerMutation();

  const handleSave = async () => {
    try {
      await submitAnswer({
        applicationId,
        payload: {
          app_question_id: Number(question.id),
          answer_text: answerText,
        },
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
          <p className="font-medium">{question.text}</p>
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
            <strong className="text-lg capitalize">
              {question.answer.answer_text}
            </strong>
          ) : (
            <span className="text-muted-foreground italic">
              No answer provided
            </span>
          )}
        </p>
      ) : (
        <div className="flex flex-row items-center justify-between">
          <Select
            onValueChange={(val) => setAnswerText(val)}
            value={question.answer?.answer_text?.toLowerCase()}
          >
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="Select answer" className="w-48" />
            </SelectTrigger>
            <SelectContent className="w-48">
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>

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
        </div>
      )}
    </Card>
  );
};

export default AppQuestionItem;
