import { useDebounce } from "@/utils/helpers";
import React, { lazy, Suspense, useMemo, useState } from "react";
import { useGetDepartmentSummaryQuery } from "../store/dashboardApiSlice";
import { PageLoader } from "@/components/loaders/PageLoader";
import { CardLoader, SectionLoader } from "../components/Loaders";
import { getApiErrorMessage } from "@/utils/handleApiError";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { Label } from "@/components/ui/label";

const InprogressDepartmentStatusGraph = lazy(
  () => import("../components/InprogressDepartmentStatusGraph"),
);
const StatusPerDepartment = lazy(
  () => import("../components/StatusPerDepartment"),
);

const InProgressDashboard: React.FC = () => {
  const [deptSlaFilter, setDeptSlaFilter] = useState<number>(0);
  const debouncedSla = useDebounce(deptSlaFilter);
  const {
    data: deptSummay,
    isLoading: isLoadingDeptSummay,
    error: deptSummayErr,
    isFetching: isFetchingDeptSummary,
  } = useGetDepartmentSummaryQuery({
    status_filter: "in_progress",
    sla_filter: debouncedSla,
  });

  const orderedDepartments = useMemo(() => {
    return [...(deptSummay?.departments ?? [])].sort((a, b) =>
      a.department.localeCompare(b.department, undefined, {
        sensitivity: "base",
      }),
    );
  }, [deptSummay?.departments]);

  if (isLoadingDeptSummay) {
    return <PageLoader label="Loading Data. Please wait" />;
  }

  return (
    <div className="space-y-6 p-2 h-full overflow-auto">
      <Card>
        <Suspense
          fallback={<SectionLoader label="Loading application summary…" />}
        >
          <StatusPerDepartment
            appStatus="in_progress"
            deptStatus="in_progress"
          />
        </Suspense>
      </Card>
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
              <p>Applications: {deptSummay?.total_apps}</p>
            </div>
            <div className="flex items-center gap-2 min-w-84">
              <Label
                htmlFor="sla-filter"
                className="text-sm font-medium text-muted-foreground"
              >
                Age of Applications
              </Label>
              <Select
                value={String(deptSlaFilter) ?? "all"}
                onValueChange={(val) => {
                  if (val) setDeptSlaFilter(Number(val));
                  else setDeptSlaFilter(0);
                }}
              >
                <SelectTrigger id="sla-filter" className="w-full max-w-48 ">
                  <SelectValue placeholder="Select duration" className="w-48" />
                </SelectTrigger>
                <SelectContent className="w-48">
                  <SelectItem value="0">Any age</SelectItem>
                  <SelectItem value="30">0 - 30 days</SelectItem>
                  <SelectItem value="60">30 - 60 days</SelectItem>
                  <SelectItem value="90">60 - 90 days</SelectItem>
                  <SelectItem value="91">90+ days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {deptSummayErr ? (
            <div>
              {getApiErrorMessage(deptSummayErr) ??
                "Error getting Department wise summary"}
            </div>
          ) : (
            <div className="grid grid-flow-col auto-cols-[420px] gap-4 overflow-x-auto">
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
                  <InprogressDepartmentStatusGraph
                    key={dept.department}
                    department={dept.department}
                    deptId={dept.department_id}
                    statuses={dept.statuses}
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

export default InProgressDashboard;
