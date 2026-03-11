import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  useGetApplicationSummaryQuery,
  useGetDepartmentSummaryQuery,
} from "../../store/dashboardApiSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { appStatusChartConfig } from "@/lib/chartConfig";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import BarChartSkeleton from "@/components/skeletons/BarChartSuspense";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { parseStatus } from "@/utils/helpers";
import {
  AppStatusOptions,
  PRIORITY_LABELS,
  SEVERITY_LABELS,
  STATUS_COLOR_MAP_BG,
  STATUS_COLOR_MAP_FG,
} from "@/utils/globalValues";
import type { AppStatuses } from "@/utils/globalTypes";
import DateRangeFilter from "@/features/_filters/DateRangeFilter";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter, Loader } from "lucide-react";
import SeverityFilters from "@/features/_filters/SeverityFilters";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import PriorityFilters from "@/features/_filters/PriorityFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const HistoricalData = lazy(() => import("./HistoricalData"));

import { Separator } from "@/components/ui/separator";
import { CardLoader, SectionLoader } from "../Loaders";
import DepartmentStatusCard from "../DepartmentStatusCard";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";

interface FilterProps {
  severity: string[];
  priority: string[];
  app_age_from?: string;
  app_age_to?: string;
}

interface DeptFilterProps extends FilterProps {
  app_status?: string;
}

const PresentData: React.FC = () => {
  const [filters, setFilters] = React.useState<FilterProps>({
    severity: [],
    priority: [],
    app_age_from: undefined,
    app_age_to: undefined,
  });

  const [deptFilters, setDeptFilters] = React.useState<DeptFilterProps>({
    severity: [],
    priority: [],
    app_age_from: undefined,
    app_age_to: undefined,
    app_status: "all",
  });

  const [syncFilters, setSyncFilters] = useState<boolean>(false);

  const { data, isLoading, error } = useGetApplicationSummaryQuery({
    severity:
      filters?.severity && filters.severity.length > 0
        ? filters.severity.join(",")
        : undefined,
    priority:
      filters?.priority && filters.priority.length > 0
        ? filters.priority.join(",")
        : undefined,
    app_age_from: filters?.app_age_from,
    app_age_to: filters?.app_age_to,
  });

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

  const orderedDepartments = useMemo(() => {
    return [...(deptSummay?.departments ?? [])].sort((a, b) =>
      String(a.department_id).localeCompare(
        String(b.department_id),
        undefined,
        {
          sensitivity: "base",
        },
      ),
    );
  }, [deptSummay?.departments]);

  useEffect(() => {
    if (syncFilters) {
      setDeptFilters({ ...filters, app_status: "all" });
    }
  }, [syncFilters, filters]);

  const navigate = useNavigate();

  const selectedSeverity = filters.severity || [];
  const visibleSeverity = selectedSeverity.slice(0, 2);
  const remainingCount = selectedSeverity.length - 2;

  const selectedPriority = filters.priority || [];
  const visiblePriority = selectedPriority.slice(0, 2);
  const remainingPriorityCount = selectedPriority.length - 2;

  return (
    <div className="space-y-6 p-2 h-full overflow-auto">
      <div className="flex gap-2 items-center">
        <Card className="h-150 flex flex-1 flex-col gap-1">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex w-full justify-between px-20">
              Present Data{" "}
              {data?.filtered_apps && (
                <span className="text-lg text-muted-foreground">
                  Applications Count:{" "}
                  <span className="text-xl text-foreground">
                    {data.filtered_apps}
                  </span>
                </span>
              )}
              <div></div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex gap-5">
            <div className="flex-1 h-full min-h-0">
              {isLoading ? (
                <BarChartSkeleton />
              ) : error ? (
                <div>{getApiErrorMessage(error)}</div>
              ) : (
                data && (
                  <ChartContainer
                    config={appStatusChartConfig}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.status_chart}
                        margin={{ top: 20, left: 10, right: 10, bottom: 0 }}
                      >
                        <CartesianGrid vertical={false} />

                        <XAxis
                          dataKey="status"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          tickFormatter={(value) =>
                            parseStatus(value)
                              .toLowerCase()
                              .replace(/^\w/, (c) => c.toUpperCase())
                          }
                        />

                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent indicator="dot" />}
                        />

                        <Bar
                          dataKey="count"
                          radius={6}
                          className="hover:cursor-pointer"
                          onClick={(data) => {
                            navigate(
                              `/applications?appStatus=${data.status === "all" ? null : data.status}&appAgeFrom=${filters?.app_age_from ? filters.app_age_from : ""}&appAgeTo=${filters?.app_age_to ? filters.app_age_to : ""}`,
                            );
                          }}
                        >
                          {data.status_chart.map((entry) => (
                            <Cell
                              key={entry.status}
                              fill={
                                STATUS_COLOR_MAP_FG[entry.status as AppStatuses]
                              }
                            />
                          ))}

                          <LabelList
                            dataKey="count"
                            position="top"
                            style={{ fontSize: 10 }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )
              )}
            </div>

            <div className="w-64 flex flex-col gap-7 border-l pl-4">
              <h3 className="font-semibold">Filters</h3>

              {/* Date Filters */}
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">Application Age</Label>

                <DateRangeFilter
                  from={filters.app_age_from}
                  to={filters.app_age_to}
                  onChange={({ from, to }) =>
                    setFilters((prev) => ({
                      ...prev,
                      app_age_from: from,
                      app_age_to: to,
                    }))
                  }
                />
              </div>

              {/* Priority Filters */}
              <div className="flex flex-col gap-1">
                <Label>Priority</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="bg-transparent w-full flex items-center justify-between"
                      variant={"outline"}
                    >
                      <span className="flex items-center gap-1 flex-wrap flex-1 min-w-0 overflow-hidden">
                        {visiblePriority.length === 0 && (
                          <span className="text-muted-foreground truncate">
                            Select priority
                          </span>
                        )}

                        {visiblePriority.map((priority) => (
                          <Badge
                            key={priority}
                            variant="secondary"
                            className="flex items-center gap-1 shrink-0"
                          >
                            {PRIORITY_LABELS[priority]}
                          </Badge>
                        ))}

                        {remainingPriorityCount > 0 && (
                          <Badge variant="outline" className="shrink-0">
                            +{remainingPriorityCount}
                          </Badge>
                        )}
                      </span>

                      <Filter
                        className={`shrink-0 ${
                          filters?.priority && filters.priority.length > 0
                            ? "text-primary fill-primary"
                            : "text-muted-foreground"
                        }`}
                        aria-hidden="true"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <PriorityFilters
                    selectedValues={filters.priority}
                    onSubmit={(data: string[]) => {
                      if (data.length > 0) {
                        setFilters((prev) => ({ ...prev, priority: data }));
                      } else {
                        setFilters((prev) => ({ ...prev, priority: [] }));
                      }
                    }}
                  />
                </DropdownMenu>
              </div>

              {/* Severity Filters */}
              <div className="flex flex-col gap-1">
                <Label>Severity</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="bg-transparent w-full flex items-center justify-between"
                      variant={"outline"}
                    >
                      <span className="flex items-center gap-1 flex-wrap flex-1 min-w-0 overflow-hidden">
                        {visibleSeverity.length === 0 && (
                          <span className="text-muted-foreground truncate">
                            Select severity
                          </span>
                        )}

                        {visibleSeverity.map((severity) => (
                          <Badge
                            key={severity}
                            variant="secondary"
                            className="flex items-center gap-1 shrink-0"
                          >
                            {SEVERITY_LABELS[severity]}
                          </Badge>
                        ))}

                        {remainingCount > 0 && (
                          <Badge variant="outline" className="shrink-0">
                            +{remainingCount}
                          </Badge>
                        )}
                      </span>

                      <Filter
                        className={`shrink-0 ${
                          filters?.severity && filters.severity.length > 0
                            ? "text-primary fill-primary"
                            : "text-muted-foreground"
                        }`}
                        aria-hidden="true"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <SeverityFilters
                    selectedValues={filters.severity}
                    onSubmit={(data: string[]) => {
                      if (data.length > 0) {
                        setFilters((prev) => ({ ...prev, severity: data }));
                      } else {
                        setFilters((prev) => ({ ...prev, severity: [] }));
                      }
                    }}
                  />
                </DropdownMenu>
              </div>

              <div className="inline-flex items-center gap-2">
                <Label>Sync Filters</Label>
                <Switch
                  checked={syncFilters}
                  onCheckedChange={setSyncFilters}
                  className="flex-none"
                />
                <Label htmlFor="toggle-label" className="text-sm font-medium">
                  {syncFilters ? "Yes" : "No"}
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
        <div>
          <Suspense fallback={<CardLoader />}>
            <HistoricalData />
          </Suspense>
        </div>
      </div>
      {isLoadingDeptSummay ? (
        <SectionLoader />
      ) : deptSummayErr ? (
        <div>{getApiErrorMessage(deptSummayErr)}</div>
      ) : (
        <Card className="px-0 gap-3 min-w-0 overflow-x-hidden">
          <CardHeader className="px-0 min-w-0">
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

          <CardContent className="min-w-0">
            <div className="flex items-center justify-between px-9 min-w-0">
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
              {/* Date Filters */}
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
            {deptSummayErr ? (
              <div>
                {getApiErrorMessage(deptSummayErr) ??
                  "Error getting Department wise summary"}
              </div>
            ) : (
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
                    />
                  ))}
                </Suspense>
                <div>
                  <Button>Expand</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PresentData;
