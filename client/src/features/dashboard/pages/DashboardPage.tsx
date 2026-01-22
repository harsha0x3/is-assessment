import React, { Suspense, useMemo, useState } from "react";
import {
  useGetApplicationSummaryQuery,
  useGetDepartmentSummaryQuery,
  useGetPriorityWiseSummaryQuery,
} from "../store/dashboardApiSlice";
import { buildDonutData, buildPriorityStackedData } from "@/lib/chartHelpers";
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

const StatusDonut = React.lazy(() => import("../components/StatusDonut"));
const DepartmentStatusCard = React.lazy(
  () => import("../components/DepartmentStatusCard"),
);
const PriorityStatusStackCard = React.lazy(
  () => import("../components/PriorityStatusStackCard"),
);
const VerticalWiseSummary = React.lazy(
  () => import("../components/VerticalWiseSummary"),
);

const SectionLoader = ({ label }: { label?: string }) => (
  <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground">
    <Loader className="h-4 w-4 animate-spin" />
    {label ?? "Loading..."}
  </div>
);

const CardLoader = () => (
  <Card className="h-72 w-95 flex items-center justify-center">
    <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
  </Card>
);

const DashboardPage: React.FC = () => {
  // 🔹 Lazy-loaded components
  const [deptStatusFilter, setDeptStatusFilter] = useState<string>("all");
  const {
    data: appsSummary,
    isLoading: isLoadingAppsSummary,
    error: appsSummaryErr,
  } = useGetApplicationSummaryQuery();
  const {
    data: deptSummay,
    isLoading: isLoadingDeptSummay,
    error: deptSummayErr,
  } = useGetDepartmentSummaryQuery({
    status_filter: deptStatusFilter,
  });
  const {
    data: prioritySummary,
    isLoading: isLoadingPrioritySummary,
    error: prioritySummaryErr,
  } = useGetPriorityWiseSummaryQuery();

  const chartData = useMemo(
    () => (prioritySummary ? buildPriorityStackedData(prioritySummary) : []),
    [prioritySummary],
  );

  if (isLoadingAppsSummary || isLoadingDeptSummay) {
    return (
      <div className="flex items-center gap-2">
        <Loader className="animate-spin" /> Loading...
      </div>
    );
  }

  if (appsSummaryErr || deptSummayErr || prioritySummaryErr) {
    return (
      <p>
        {appsSummaryErr
          ? getApiErrorMessage(appsSummaryErr)
          : deptSummayErr
            ? getApiErrorMessage(deptSummayErr)
            : prioritySummaryErr
              ? getApiErrorMessage(prioritySummaryErr)
              : "Error fetching summary"}
      </p>
    );
  }

  return (
    <div className="space-y-6 p-2 h-full overflow-auto">
      {/* ---------- Application-wide summary ---------- */}
      <Card>
        <Suspense
          fallback={<SectionLoader label="Loading application summary…" />}
        >
          {!isLoadingAppsSummary && appsSummary && (
            <StatusDonut
              data={buildDonutData(
                appsSummary.status_chart,
                appsSummary.total_apps,
              )}
              total_count={appsSummary.total_apps}
            />
          )}
        </Suspense>

        {isLoadingAppsSummary && (
          <SectionLoader label="Loading application summary…" />
        )}
        {appsSummaryErr && <p>{getApiErrorMessage(appsSummaryErr)}</p>}
      </Card>

      {/* ---------- Department-wise summary ---------- */}
      <Card className="px-0">
        <CardHeader className="px-0">
          <div className="flex w-full items-center">
            <div className="flex items-center gap-2 pl-9">
              <p>Applications' Status</p>
              <Select
                value={deptStatusFilter}
                onValueChange={(value) => setDeptStatusFilter(value)}
              >
                <SelectTrigger
                  id="app-status"
                  className="disabled:border disabled:font-medium disabled:text-card-foreground disabled:opacity-100 disabled:cursor-auto"
                  style={{
                    backgroundColor: deptStatusFilter
                      ? STATUS_COLOR_MAP_BG[deptStatusFilter as AppStatuses]
                      : undefined,
                    color: deptStatusFilter
                      ? STATUS_COLOR_MAP_FG[deptStatusFilter as AppStatuses]
                      : undefined,
                  }}
                >
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value="all">All</SelectItem>
                  {AppStatusOptions.map((s, idx) => {
                    return (
                      <>
                        <SelectItem
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
            <CardTitle className="text-center flex-1">
              Department Wise Status Summary
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="grid grid-flow-col auto-cols-[380px] gap-4 overflow-x-auto">
          <Suspense
            fallback={
              <>
                <CardLoader />
                <CardLoader />
                <CardLoader />
              </>
            }
          >
            {deptSummay?.departments.map((dept) => (
              <DepartmentStatusCard
                key={dept.department}
                department={dept.department}
                deptId={dept.department_id}
                statuses={dept.statuses}
                deptStatusFilter={deptStatusFilter}
              />
            ))}
          </Suspense>
        </CardContent>
      </Card>

      <Card className="px-0">
        <CardHeader>
          <CardTitle className="text-center">
            Priority Wise Status Summary
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-flow-col auto-cols-[380px] gap-4 overflow-x-auto">
          {isLoadingPrioritySummary && (
            <>
              <CardLoader />
              <CardLoader />
            </>
          )}

          {prioritySummaryErr && (
            <p>{getApiErrorMessage(prioritySummaryErr)}</p>
          )}

          <Suspense
            fallback={
              <>
                <CardLoader />
                <CardLoader />
              </>
            }
          >
            {chartData.map((item) => (
              <PriorityStatusStackCard key={item.priority} data={item} />
            ))}
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <Suspense
          fallback={
            <SectionLoader label="Loading vertical wise applications summary" />
          }
        >
          <VerticalWiseSummary />
        </Suspense>
      </Card>
    </div>
  );
};

export default DashboardPage;
