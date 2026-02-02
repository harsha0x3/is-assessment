import React, { Suspense, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/utils/helpers";
import { CardLoader, SectionLoader } from "../components/Loaders";

const StatusDonut = React.lazy(() => import("../components/StatusDonut"));
const DepartmentStatusCard = React.lazy(
  () => import("../components/DepartmentStatusCard"),
);

const DashboardPage: React.FC = () => {
  // 🔹 Lazy-loaded components
  const [deptStatusFilter, setDeptStatusFilter] = useState<string>("all");
  const [deptSlaFilter, setDeptSlaFilter] = useState<number>(0);
  const debouncedSla = useDebounce(deptSlaFilter);
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
    status_filter: deptStatusFilter,
    sla_filter: debouncedSla,
  });

  const orderedDepartments = useMemo(() => {
    return [...(deptSummay?.departments ?? [])].sort((a, b) =>
      a.department.localeCompare(b.department, undefined, {
        sensitivity: "base",
      }),
    );
  }, [deptSummay?.departments]);

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
            <div className="flex flex-col gap-2 min-w-64">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Applications older than
                </p>
                <span className="text-sm font-semibold">
                  {deptSlaFilter === 0 ? "Any age" : `${deptSlaFilter} days`}
                </span>
              </div>

              <Input
                type="range"
                min={0}
                max={90}
                step={15}
                value={deptSlaFilter}
                onChange={(e) => setDeptSlaFilter(Number(e.target.value))}
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>30</span>
                <span>60</span>
                <span>90+</span>
              </div>
            </div>
          </div>
          {deptSummayErr ? (
            <div>
              {getApiErrorMessage(deptSummayErr) ??
                "Error getting Department wise summary"}
            </div>
          ) : (
            <div className="grid grid-flow-col auto-cols-[380px] gap-4 overflow-x-auto">
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
                    deptStatusFilter={deptStatusFilter}
                    appSlaFilter={deptSlaFilter}
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
