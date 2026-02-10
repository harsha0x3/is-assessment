import React, { useEffect } from "react";
import { useGetDepartmentsByApplicationQuery } from "../store/departmentsApiSlice";
import {
  Outlet,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getApiErrorMessage } from "@/utils/handleApiError";
import { useSelector } from "react-redux";
import { selectUserDepts } from "@/features/auth/store/authSlice";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageLoader } from "@/components/loaders/PageLoader";

const AppDepartments: React.FC = () => {
  const isMobile = useIsMobile();

  const { appId, deptId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userDepts = useSelector(selectUserDepts);
  const {
    data: appDepts,
    isLoading: isLoadingDepts,
    error,
  } = useGetDepartmentsByApplicationQuery(appId || "", {
    skip: !appId || !isMobile,
  });

  useEffect(() => {
    if (!isMobile) return;
    if (!appId || deptId) return;
    if (!appDepts?.data?.length) return;

    const firstAllowedDept =
      appDepts.data.find((dept) => userDepts.includes(dept.id)) ??
      appDepts.data[0];

    if (firstAllowedDept) {
      navigate(`${firstAllowedDept.id}/comments?${searchParams.toString()}`);
    }
  }, [isMobile, appId, deptId, appDepts, userDepts]);

  const activeSubTab = location.pathname.includes("evidences")
    ? "evidences"
    : location.pathname.includes("comments")
      ? "comments"
      : "questionnaire";

  return (
    <div className="w-full h-full flex flex-col text-center">
      {isMobile && (
        <>
          {isLoadingDepts ? (
            <PageLoader />
          ) : error ? (
            <p>{getApiErrorMessage(error)}</p>
          ) : (
            <Tabs value={deptId} className="flex flex-col h-full">
              <TabsList className="overflow-x-auto">
                {appDepts?.data?.map((dept) => (
                  <TabsTrigger
                    key={dept.id}
                    value={String(dept.id)}
                    onClick={() =>
                      navigate(`${dept.id}/comments?${searchParams.toString()}`)
                    }
                    className="cursor-pointer"
                  >
                    {dept.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </>
      )}
      <Tabs value={activeSubTab} className="flex gap-4 flex-col h-full">
        <TabsList className="bg-background rounded-none border-b p-0 flex justify-center w-full">
          <TabsTrigger
            value="comments"
            onClick={() =>
              navigate(`${deptId}/comments?${searchParams.toString()}`)
            }
            className="bg-background cursor-pointer data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
          >
            Comments
          </TabsTrigger>

          <TabsTrigger
            value="evidences"
            onClick={() =>
              navigate(`${deptId}/evidences?${searchParams.toString()}`)
            }
            className="bg-background cursor-pointer data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
          >
            Evidences
          </TabsTrigger>
          <TabsTrigger
            value="questionnaire"
            onClick={() =>
              navigate(`${deptId}/questionnaire?${searchParams.toString()}`)
            }
            className="bg-background cursor-pointer data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none"
          >
            Questionnaire
          </TabsTrigger>
        </TabsList>
        <div className="text-left flex-1 min-h-0">
          <Outlet />
        </div>
      </Tabs>
    </div>
  );
};

export default AppDepartments;
