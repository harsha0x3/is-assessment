import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageLoader } from "@/components/loaders/PageLoader";
import { toast } from "sonner";

import {
  useGetQuestionsWithAnswersQuery,
  useSubmitBulkAnswersMutation,
} from "../store/appQuestionnaireApiSlice";
import AppQuestionItem from "./AppQuestionItem";
import { useState } from "react";

interface FormValues {
  answers: Record<number, string>;
}

const AppQuestionnaire = () => {
  const { appId } = useParams<{ appId: string }>();

  const { data, isLoading } = useGetQuestionsWithAnswersQuery(appId ?? "", {
    skip: !appId,
  });
  const [isEditing, setIsEditing] = useState(false);

  const [submitBulkAnswers, { isLoading: saving }] =
    useSubmitBulkAnswersMutation();

  const form = useForm<FormValues>({
    defaultValues: {
      answers: {},
    },
  });

  if (isLoading) return <PageLoader label="Loading questionnaire" />;

  const onSubmit = async (values: FormValues) => {
    try {
      const answers = Object.entries(values.answers).map(
        ([questionId, optionId]) => ({
          app_question_id: Number(questionId),
          answer_option_id: Number(optionId),
        }),
      );

      await submitBulkAnswers({
        applicationId: appId!,
        payload: { answers },
      }).unwrap();
      setIsEditing(false);
      toast.success("Questionnaire submitted");
    } catch {
      toast.error("Failed to submit answers");
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden gap-3">
      <CardHeader>
        <CardTitle>Application Questionnaire</CardTitle>
      </CardHeader>

      <ScrollArea className="flex-1 min-h-0 pr-1 scroll-smooth">
        <CardContent className="h-full">
          <form
            id="questionnaire-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className=""
          >
            <div className="space-y-6 py-4">
              {data?.map((question) => (
                <AppQuestionItem
                  key={question.id}
                  question={question}
                  form={form}
                  isEditing={isEditing}
                />
              ))}
            </div>
          </form>
        </CardContent>
      </ScrollArea>
      <CardFooter className="justify-end gap-2 px-7">
        {!isEditing ? (
          <Button type="button" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>

            <Button type="submit" form="questionnaire-form" disabled={saving}>
              {saving ? "Submitting..." : "Save"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default AppQuestionnaire;
