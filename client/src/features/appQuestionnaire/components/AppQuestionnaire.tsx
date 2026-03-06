import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/loaders/PageLoader";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { useGetQuestionsWithAnswersQuery } from "../store/appQuestionnaireApiSlice";
import AppQuestionItem from "./AppQuestionItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import CriticalityRules from "./CriticalRules";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const AppQuestionnaire: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();

  const { data, isLoading, error } = useGetQuestionsWithAnswersQuery(
    appId ?? "",
    {
      skip: !appId,
    },
  );

  if (isLoading) {
    return <PageLoader label="Loading questionnaire" />;
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          {getApiErrorMessage(error) ?? "Failed to load questionnaire"}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col min-h-0 h-full w-full">
      <CardHeader className="text-lg font-semibold flex items-center gap-4">
        <CardTitle>Application Questionnaire</CardTitle>

        <Dialog>
          <DialogTrigger asChild>
            <Button>Show Evaluation Rules</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <CriticalityRules />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-auto">
        <ScrollArea className="min-h-0 px-4 h-full w-full">
          <div className="space-y-4 py-4">
            {(data ?? []).map((q) => (
              <AppQuestionItem
                key={q.id}
                question={q}
                canAnswer={true}
                applicationId={appId!}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AppQuestionnaire;
