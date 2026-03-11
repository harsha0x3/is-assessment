import React, { Suspense, useEffect, useMemo, useState } from "react";
import {
  useGetApplicationSummaryQuery,
  useGetDepartmentSummaryQuery,
} from "../store/dashboardApiSlice";
import { buildDonutData } from "@/lib/chartHelpers";
import { Loader } from "lucide-react";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AppStatusOptions,
  STATUS_COLOR_MAP_BG,
  STATUS_COLOR_MAP_FG,
} from "@/utils/globalValues";
import type { AppStatuses } from "@/utils/globalTypes";
import { Separator } from "@/components/ui/separator";
import { PageLoader } from "@/components/loaders/PageLoader";
import { CardLoader, SectionLoader } from "../components/Loaders";
import { Label } from "@/components/ui/label";
import AppStatusCard from "../components/AppStatusCard";
import { Button } from "@/components/ui/button";

const StatusDonut = React.lazy(() => import("../components/StatusDonut"));
const DepartmentStatusCard = React.lazy(
  () => import("../components/DepartmentStatusCard"),
);

import { useLazyExportApplicationsCSVQuery } from "../store/exportsApiSlice";
import { toast } from "sonner";
import DateRangeFilter from "@/features/_filters/DateRangeFilter";

interface DeptFilterProps {
  severity: string[];
  priority: string[];
  app_age_from?: string;
  app_age_to?: string;
  app_status?: string;
}

const DashboardPage: React.FC = () => {
  // 🔹 Lazy-loaded components

  const [deptFilters, setDeptFilters] = React.useState<DeptFilterProps>({
    severity: [],
    priority: [],
    app_age_from: undefined,
    app_age_to: undefined,
    app_status: "all",
  });
  const {
    data: appsSummary,
    isLoading: isLoadingAppsSummary,
    error: appsSummaryErr,
  } = useGetApplicationSummaryQuery();
  const {
    data: deptSummay,
    isLoading: isLoadingDeptSummay,
    error: deptSummayErr,
    isFetching: isFetchingDeptSummary,
  } = useGetDepartmentSummaryQuery({
    app_status: deptFilters?.app_status ?? "all",
    severity:
      deptFilters?.severity && deptFilters.severity.length > 0
        ? deptFilters.severity.join(",")
        : undefined,
    priority:
      deptFilters?.priority && deptFilters.priority.length > 0
        ? deptFilters.priority.join(",")
        : undefined,
    app_age_from: deptFilters?.app_age_from,
    app_age_to: deptFilters?.app_age_to,
  });

  useEffect(() => {
    console.log("DEPT FILTES", deptFilters);
  }, [deptFilters]);

  const [trigger, { isLoading }] = useLazyExportApplicationsCSVQuery();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const orderedDepartments = useMemo(() => {
    return [...(deptSummay?.departments ?? [])].sort((a, b) =>
      a.department.localeCompare(b.department, undefined, {
        sensitivity: "base",
      }),
    );
  }, [deptSummay?.departments]);

  const statusCardData = useMemo(() => {
    if (appsSummary) {
      return buildDonutData(appsSummary.status_chart, appsSummary.total_apps);
    }
    return undefined;
  }, [appsSummary]);

  if (isLoadingAppsSummary || isLoadingDeptSummay) {
    return <PageLoader label="Loading Data. Please wait" />;
  }

  return (
    <div className="space-y-6 p-2 h-full overflow-auto">
      {/* ---------- Application-wide summary ---------- */}
      <Card>
        <Suspense
          fallback={<SectionLoader label="Loading application summary…" />}
        >
          {!isLoadingAppsSummary && appsSummary && (
            <React.Fragment>
              <CardHeader>
                <div className="w-full flex items-center">
                  <CardTitle className="text-center text-lg flex-1">
                    Overall Application Status Summary
                  </CardTitle>
                  <Button
                    onClick={async () => {
                      try {
                        setIsDownloading(true);
                        const blob = await trigger().unwrap();

                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");

                        link.href = url;
                        link.download = "is_assessment_all_applications.csv";

                        document.body.appendChild(link);
                        link.click();

                        link.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        toast.error(
                          getApiErrorMessage(error) ??
                            "Error downloading the report",
                        );
                      } finally {
                        setIsDownloading(false);
                      }
                    }}
                    disabled={isLoading || isDownloading}
                  >
                    {isLoading || isDownloading ? (
                      <span className="flex items-center">
                        <Loader className="animnate-spin" />
                      </span>
                    ) : (
                      "Export"
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-2">
                <StatusDonut
                  data={buildDonutData(
                    appsSummary.status_chart,
                    appsSummary.total_apps,
                  )}
                  total_count={appsSummary.total_apps}
                />
                <div className="grid grid-cols-2 gap-3 items-center">
                  {statusCardData &&
                    statusCardData.map((item) => (
                      <AppStatusCard
                        key={item.name}
                        data={{
                          name: item.name,
                          count: item.count,
                          percent: item.value,
                        }}
                      />
                    ))}
                </div>
              </CardContent>
            </React.Fragment>
          )}
        </Suspense>

        {isLoadingAppsSummary && (
          <SectionLoader label="Loading application summary…" />
        )}
        {appsSummaryErr && <p>{getApiErrorMessage(appsSummaryErr)}</p>}
      </Card>

      {/* ---------- Department-wise summary ---------- */}
      <Card className="px-0 gap-3">
        <CardHeader className="px-0">
          <div className="flex gap-3 w-full items-center">
            <CardTitle className="text-center flex-1">
              Department Wise Status Summary
            </CardTitle>
          </div>
          {isFetchingDeptSummary && (
            <div className="w-full flex items-center justify-center text-center text-sm text-muted-foreground">
              <p className="flex items-center gap-2 border p-2 rounded w-fit">
                <Loader className="animate-spin" />
                Applying filters..
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="">
          <div className="flex items-center justify-between pl-9">
            <div className="flex items-center gap-2">
              <p>Applications' Status</p>
              <Select
                value={deptFilters.app_status}
                onValueChange={(value) =>
                  setDeptFilters((prev) => ({
                    ...prev,
                    app_status: value,
                  }))
                }
              >
                <SelectTrigger
                  id="app-status"
                  className="disabled:border disabled:font-medium disabled:text-card-foreground disabled:opacity-100 disabled:cursor-auto"
                  style={{
                    backgroundColor: deptFilters.app_status
                      ? STATUS_COLOR_MAP_BG[
                          deptFilters.app_status as AppStatuses
                        ]
                      : undefined,
                    color: deptFilters.app_status
                      ? STATUS_COLOR_MAP_FG[
                          deptFilters.app_status as AppStatuses
                        ]
                      : undefined,
                  }}
                >
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value="all">All</SelectItem>
                  {AppStatusOptions.map((s, idx) => {
                    return (
                      <>
                        <SelectItem
                          key={idx}
                          value={s.value}
                          style={{
                            color: STATUS_COLOR_MAP_FG[s.value],
                          }}
                          className=""
                        >
                          {s.label}
                        </SelectItem>
                        {idx !== AppStatusOptions.length && <Separator />}
                      </>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <p>Applications: {deptSummay?.total_apps}</p>
            </div>
            <div className="flex items-center gap-2 min-w-84">
              <Label
                htmlFor="sla-filter"
                className="text-sm font-medium text-muted-foreground"
              >
                Age of Applications
              </Label>
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">Application Age</Label>

                <DateRangeFilter
                  from={deptFilters.app_age_from}
                  to={deptFilters.app_age_to}
                  onChange={({ from, to }) =>
                    setDeptFilters((prev) => ({
                      ...prev,
                      app_age_from: from,
                      app_age_to: to,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          {deptSummayErr ? (
            <div>
              {getApiErrorMessage(deptSummayErr) ??
                "Error getting Department wise summary"}
            </div>
          ) : (
            <div className="grid grid-flow-col auto-cols-lg gap-4 overflow-x-auto">
              <Suspense
                fallback={
                  <>
                    <CardLoader />
                    <CardLoader />
                    <CardLoader />
                  </>
                }
              >
                {orderedDepartments.map((dept) => (
                  <DepartmentStatusCard
                    key={dept.department}
                    department={dept.department}
                    deptId={dept.department_id}
                    statuses={dept.statuses}
                    deptStatusFilter={deptFilters?.app_status}
                    appAgeFrom={deptFilters?.app_age_from}
                    appAgeTo={deptFilters?.app_age_to}
                  />
                ))}
              </Suspense>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
