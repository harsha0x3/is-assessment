// src\features\deptQuestionnaire\components\DepartmentQuestionnaire.tsx

import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageLoader } from "@/components/loaders/PageLoader";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { useGetDeptQuestionnaireWithAnswersQuery } from "../store/deptQuestionnaireApiSlice";
import QuestionnaireList from "./QuestionnaireList";
import { ScrollArea } from "@/components/ui/scroll-area";

const DepartmentQuestionnaire: React.FC = () => {
  const { appId, deptId } = useParams<{ appId: string; deptId: string }>();
  const deptIdNumber = Number(deptId);

  const { data, isLoading, error } = useGetDeptQuestionnaireWithAnswersQuery(
    { appId: appId!, deptId: deptIdNumber },
    { skip: !appId || !deptId },
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
    <Card className="flex flex-col">
      <CardHeader className="text-lg font-semibold">
        Department Questionnaire
      </CardHeader>

      {/* 👇 This mirrors DepartmentInfo behavior */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-98 xl:h-125 2xl:h-135 px-6">
          <QuestionnaireList
            appId={appId!}
            deptId={deptIdNumber}
            questions={data ?? []}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DepartmentQuestionnaire;
