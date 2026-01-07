import React from "react";
import { useGetDepartmentsByApplicationQuery } from "../store/departmentsApiSlice";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DepartmentInfo from "./DepartmentInfo";

const AppDepartments: React.FC = () => {
  const { appId } = useParams();
  const { data: appDepts, isLoading: isLoadingDepts } =
    useGetDepartmentsByApplicationQuery(appId || "", { skip: !appId });
  return (
    <div className="w-full">
      {appDepts?.data && (
        <Tabs className="gap-4 " defaultValue={appDepts?.data[0].id.toString()}>
          <div className="overflow-auto">
            <TabsList className="bg-background gap-1 border p-1 overflow-auto">
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
            <TabsContent key={dept.id} value={dept.id.toString()}>
              <DepartmentInfo deptId={dept.id} appId={appId ?? ""} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default AppDepartments;
