import React from "react";
import { useGetDepartmentsByApplicationQuery } from "../store/departmentsApiSlice";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DepartmentInfo from "./DepartmentInfo";
import { Loader } from "lucide-react";
import { getApiErrorMessage } from "@/utils/handleApiError";

const AppDepartments: React.FC = () => {
  const { appId } = useParams();
  const {
    data: appDepts,
    isLoading: isLoadingDepts,
    error,
  } = useGetDepartmentsByApplicationQuery(appId || "", { skip: !appId });
  return (
    <div className="w-full">
      {isLoadingDepts ? (
        <div>
          <Loader className="animate-spin h-5 w-5" />
        </div>
      ) : error ? (
        <p>{getApiErrorMessage(error) ?? "Error finding departments"}</p>
      ) : appDepts?.data ? (
        <Tabs
          className="gap-4 text-center"
          defaultValue={appDepts?.data[0].id.toString()}
        >
          <div className="overflow-auto">
            <TabsList className="bg-background gap-1 border text-left p-1 overflow-auto">
              {appDepts.data.map((dept) => (
                <TabsTrigger
                  key={dept.id}
                  value={dept.id.toString()}
                  className="data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent"
                >
                  {dept.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {appDepts.data.map((dept) => (
            <TabsContent
              className="text-left"
              key={dept.id}
              value={dept.id.toString()}
            >
              <DepartmentInfo deptId={dept.id} appId={appId ?? ""} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <p>No Departments found</p>
      )}
    </div>
  );
};

export default AppDepartments;
