import React, { useEffect, useMemo, Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDepartmentSummaryQuery } from "../../store/dashboardApiSlice";
import DepartmentStatusCard from "../DepartmentStatusCard";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { Loader } from "lucide-react";
import { SectionLoader, CardLoader } from "../Loaders";
import { Label } from "@/components/ui/label";
import DateRangeFilter from "@/features/_filters/DateRangeFilter";
import { Separator } from "@/components/ui/separator";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  STATUS_COLOR_MAP_BG,
  STATUS_COLOR_MAP_FG,
  AppStatusOptions,
} from "@/utils/globalValues";

import type {
  DeptFilterProps,
  FilterProps,
} from "../../pages/AnalyticsDashboard";

import type { AppStatuses } from "@/utils/globalTypes";

interface Props {
  filters: FilterProps;
  deptFilters: DeptFilterProps;
  setDeptFilters: React.Dispatch<React.SetStateAction<DeptFilterProps>>;
  syncFilters: boolean;
}

const DepartmentSummarySection: React.FC<Props> = ({
  filters,
  deptFilters,
  setDeptFilters,
  syncFilters,
}) => {
  /* ---------------- Filter Sync ---------------- */

  useEffect(() => {
    if (syncFilters) {
      setDeptFilters((prev) => ({
        ...prev,
        severity: filters.severity,
        priority: filters.priority,
        app_age_from: filters.app_age_from,
        app_age_to: filters.app_age_to,
      }));
    }
  }, [filters, syncFilters, setDeptFilters]);

  /* ---------------- API Query ---------------- */

  const { data, isLoading, error, isFetching } = useGetDepartmentSummaryQuery(
    {
      app_status: deptFilters?.app_status ?? "all",
      severity:
        deptFilters?.severity?.length > 0
          ? deptFilters.severity.join(",")
          : undefined,
      priority:
        deptFilters?.priority?.length > 0
          ? deptFilters.priority.join(",")
          : undefined,
      app_age_from: deptFilters?.app_age_from,
      app_age_to: deptFilters?.app_age_to,
    },
    {
      pollingInterval: 200000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const [isFilterLoading, setIsFilterLoading] = useState(false);

  useEffect(() => {
    if (!isFetching) {
      setIsFilterLoading(false);
    }
  }, [isFetching]);

  /* ---------------- Sort Departments ---------------- */

  const orderedDepartments = useMemo(() => {
    return [...(data?.departments ?? [])].sort(
      (a, b) => a.department_id - b.department_id,
    );
  }, [data?.departments]);

  /* ---------------- Loading ---------------- */

  if (isLoading) {
    return <SectionLoader />;
  }

  if (error) {
    return <div>{getApiErrorMessage(error)}</div>;
  }

  /* ---------------- UI ---------------- */

  return (
    <Card className="px-0 gap-2 min-w-0 overflow-x-hidden">
      <CardHeader className="px-0 min-w-0">
        <div className="flex gap-3 w-full items-center">
          <CardTitle className="text-center flex-1">
            Department Wise Status Summary
          </CardTitle>
        </div>

        {isFetching && isFilterLoading && (
          <div className="w-full flex items-center justify-center text-sm text-muted-foreground">
            <p className="flex items-center gap-2 border p-2 rounded w-fit">
              <Loader className="animate-spin h-4 w-4" />
              Applying filters...
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="min-w-0">
        {/* Top Controls */}

        <div className="flex items-center justify-between px-9 min-w-0 flex-wrap gap-4">
          {/* Status Filter */}

          <div className="flex items-center gap-2">
            <p>Applications' Status</p>

            <Select
              value={deptFilters.app_status}
              onValueChange={(value) => {
                setIsFilterLoading(true);

                setDeptFilters((prev) => ({
                  ...prev,
                  app_status: value,
                }));
              }}
            >
              <SelectTrigger
                id="app-status"
                className="disabled:border disabled:font-medium disabled:text-card-foreground disabled:opacity-100 disabled:cursor-auto"
                style={{
                  backgroundColor: deptFilters.app_status
                    ? STATUS_COLOR_MAP_BG[deptFilters.app_status as AppStatuses]
                    : undefined,
                  color: deptFilters.app_status
                    ? STATUS_COLOR_MAP_FG[deptFilters.app_status as AppStatuses]
                    : undefined,
                }}
              >
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All</SelectItem>

                {AppStatusOptions.map((s, idx) => (
                  <React.Fragment key={s.value}>
                    <SelectItem
                      value={s.value}
                      style={{ color: STATUS_COLOR_MAP_FG[s.value] }}
                    >
                      {s.label}
                    </SelectItem>

                    {idx !== AppStatusOptions.length - 1 && <Separator />}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Applications Count */}

          <div className="flex items-center gap-2">
            <p>Applications: {data?.total_apps}</p>
          </div>

          {/* Date Filter */}

          <div className="flex flex-col gap-1">
            <Label className="text-sm font-medium">Application Age</Label>

            <DateRangeFilter
              from={deptFilters.app_age_from}
              to={deptFilters.app_age_to}
              onChange={({ from, to }) => {
                setIsFilterLoading(true);
                setDeptFilters((prev) => ({
                  ...prev,
                  app_age_from: from,
                  app_age_to: to,
                }));
              }}
            />
          </div>
        </div>

        {/* Department Cards */}

        <div className="mt-4">
          <div className="grid grid-flow-col auto-cols-lg gap-4 overflow-x-auto min-w-0 scroll-smooth">
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
                  assignedApps={dept?.total_apps}
                  totalApps={data?.total_apps}
                />
              ))}
            </Suspense>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentSummarySection;
