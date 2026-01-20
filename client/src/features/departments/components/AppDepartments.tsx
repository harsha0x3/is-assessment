import React, { useEffect } from "react";
import { useGetDepartmentsByApplicationQuery } from "../store/departmentsApiSlice";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Loader } from "lucide-react";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { useSelector } from "react-redux";
import { selectUserDepts } from "@/features/auth/store/authSlice";

const AppDepartments: React.FC = () => {
  const { appId, deptId } = useParams();
  const navigate = useNavigate();
  const userDepts = useSelector(selectUserDepts);
  const {
    data: appDepts,
    isLoading: isLoadingDepts,
    error,
  } = useGetDepartmentsByApplicationQuery(appId || "", { skip: !appId });
  useEffect(() => {
    if (!appId) return;
    if (deptId) return; // already on a department route
    if (!appDepts?.data?.length) return;
    if (!userDepts.length) return;

    // find first department the user has access to
    const firstAllowedDept = appDepts.data.find((dept) =>
      userDepts.includes(dept.id),
    );

    if (firstAllowedDept) {
      navigate(`${firstAllowedDept.id}`, { replace: true });
    }
  }, [appId, deptId, appDepts, userDepts, navigate]);

  return (
    <div className="w-full">
      {isLoadingDepts ? (
        <div>
          <Loader className="animate-spin h-5 w-5" />
        </div>
      ) : error ? (
        <p>{getApiErrorMessage(error) ?? "Error finding departments"}</p>
      ) : appDepts?.data ? (
        <Tabs className="gap-4 text-center" value={deptId}>
          <div className="overflow-auto">
            <TabsList className="bg-background gap-1 border text-left p-1 overflow-auto">
              {appDepts.data.map((dept) => (
                <TabsTrigger
                  key={dept.id}
                  value={dept.id.toString()}
                  onClick={() => navigate(`${dept.id}`)}
                  className="data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent"
                >
                  {dept.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="text-left">
            <Outlet />
          </div>
        </Tabs>
      ) : (
        <p>No Departments found</p>
      )}
    </div>
  );
};

export default AppDepartments;
