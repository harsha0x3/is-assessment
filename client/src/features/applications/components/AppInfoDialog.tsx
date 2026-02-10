import { Dialog, DialogContent } from "@/components/ui/dialog";
import React, { useEffect, useMemo, useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useGetApplicationDetailsQuery } from "../store/applicationsApiSlice";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { useSelector } from "react-redux";
import { selectUserDepts } from "@/features/auth/store/authSlice";
import { PageLoader } from "@/components/loaders/PageLoader";

const AppInfoDialog: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { appId, deptId: activeDeptId } = useParams();
  const {
    data: appDetails,
    isLoading,
    error,
  } = useGetApplicationDetailsQuery(appId as string, {
    skip: !appId,
  });

  const appName = useMemo<string>(
    () => appDetails?.data.name ?? "",
    [appDetails],
  );
  const userDepts = useSelector(selectUserDepts);

  const [isOpen, setIsOpen] = useState(
    location.pathname.startsWith("/applications/details"),
  );

  const tabs = [
    { name: "Overview", value: "overview" },
    { name: "Departments", value: "departments" },
    { name: "Evidences", value: "evidences" },
    { name: "Questionnaire", value: "questionnaire" },
  ];

  const currentTab = useMemo(() => {
    const path = location.pathname;
    return tabs.find((t) => path.includes(t.value))?.value ?? "overview";
  }, [location.pathname]);

  useEffect(() => {
    if (
      location.pathname.startsWith("/applications/details") &&
      !location.pathname.match(/overview|departments|evidences|questionnaire/)
    ) {
      navigate(`overview?${searchParams.toString()}`);
    }
  }, [location.pathname, navigate]);

  const firstAllowedDept = useMemo(() => {
    if (appDetails?.data.departments) {
      return (
        appDetails?.data.departments.find((dept) =>
          userDepts.includes(dept.id),
        ) ?? appDetails?.data?.departments[0]
      );
    }
  }, [appDetails]);

  useEffect(() => {
    setIsOpen(location.pathname.startsWith("/applications/details"));
  }, [location.pathname]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(false);
        navigate(`/applications?${searchParams.toString()}`);
      }}
    >
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-none xs:w-135! sm:w-160! md:max-w-none md:w-260! lg:max-w-none lg:w-300! max-w-none h-[calc(100vh-3rem)] min-h-0"
      >
        {/* Root layout — unchanged flex behavior */}
        {isLoading ? (
          <PageLoader label="Loading Application Details" />
        ) : error ? (
          <p>
            {getApiErrorMessage(error) ?? "Error getting application details"}
          </p>
        ) : appDetails?.data ? (
          <div className="flex flex-col md:grid md:grid-cols-[16rem_1fr] min-h-0 h-full">
            {/* Mobile / Tablet top tabs */}
            <div className="md:hidden border-b">
              <Tabs value={currentTab} className="w-full">
                <TabsList className="w-full flex">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      onClick={() =>
                        navigate(
                          `/applications/details/${appId}/${tab.value}?${searchParams.toString()}`,
                        )
                      }
                      className="flex-1 rounded-none"
                    >
                      {tab.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Desktop sidebar */}
            <aside className="hidden md:flex flex-col border-r bg-muted/30">
              <div className="p-4">
                <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                  Application
                </h2>

                <nav className="flex flex-col gap-1 text-sm">
                  {/* Overview */}
                  <NavLink
                    to={`/applications/details/${appId}/overview?${searchParams.toString()}`}
                    state={{ appName }}
                    className={({ isActive }) =>
                      cn(
                        "px-4 py-2 rounded-md transition-colors",
                        "hover:bg-muted",
                        isActive &&
                          "bg-background font-semibold text-primary border-l-4 border-primary",
                      )
                    }
                  >
                    Overview
                  </NavLink>

                  {/* Departments */}
                  <div>
                    <NavLink
                      to={`/applications/details/${appId}/departments/${firstAllowedDept?.id}/comments?${searchParams.toString()}`}
                      state={{ appName }}
                      className={cn(
                        "px-4 py-2 rounded-md transition-colors flex items-center",
                        "hover:bg-muted",
                        currentTab == "departments" &&
                          "bg-background font-semibold text-primary border-l-4 border-primary",
                      )}
                    >
                      Departments
                    </NavLink>

                    {/* Sub categories */}

                    <div
                      className={`ml-2 flex flex-col gap-1 mt-1 pl-1 rounded transition-colors ${currentTab == "departments" ? "border-l-3 border-primary/70" : "border-l-3"} pt-2`}
                    >
                      {appDetails?.data?.departments?.map((dept) => {
                        const isActiveDept = String(dept.id) === activeDeptId;
                        return (
                          <NavLink
                            key={dept.id}
                            to={`/applications/details/${appId}/departments/${dept.id}/comments?${searchParams.toString()}`}
                            state={{ appName, department: dept }}
                            className={cn(
                              "px-4 py-1.5 rounded-md text-xs transition-colors hover:bg-muted",
                              isActiveDept &&
                                "bg-muted font-semibold text-primary border-l-2 border-primary",
                            )}
                          >
                            {dept.name}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>

                  {/* All Evidences */}
                  <NavLink
                    to={`/applications/details/${appId}/evidences?${searchParams.toString()}`}
                    state={{ appName }}
                    className={({ isActive }) =>
                      cn(
                        "px-4 py-2 rounded-md transition-colors",
                        "hover:bg-muted",
                        isActive &&
                          "bg-background font-semibold text-primary border-l-4 border-primary",
                      )
                    }
                  >
                    All Evidences
                  </NavLink>

                  {/* Questionnaire */}
                  <NavLink
                    to={`/applications/details/${appId}/questionnaire?${searchParams.toString()}`}
                    state={{ appName }}
                    className={({ isActive }) =>
                      cn(
                        "px-4 py-2 rounded-md transition-colors",
                        "hover:bg-muted",
                        isActive &&
                          "bg-background font-semibold text-primary border-l-4 border-primary",
                      )
                    }
                  >
                    Questionnaire
                  </NavLink>
                </nav>
              </div>
            </aside>

            {/* Content area — outlet behavior preserved */}
            <main className="flex flex-col min-h-0 overflow-hidden md:mr-7 px-6 pt-6 pb-0 gap-6">
              <header className="border-b pb-2">
                <h1 className="text-lg font-semibold truncate">{appName}</h1>
              </header>

              <div className="flex-1 min-h-0 overflow-hidden">
                <Outlet />
              </div>
            </main>
          </div>
        ) : (
          <p>No</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AppInfoDialog;
