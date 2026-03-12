import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label as ChartLabel,
} from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useGetApptypeSummaryQuery } from "../../store/dashboardApiSlice";

import { getApiErrorMessage } from "@/utils/handleApiError";
import BarChartSkeleton from "@/components/skeletons/BarChartSuspense";

import DateRangeFilter from "@/features/_filters/DateRangeFilter";
import PriorityFilters from "@/features/_filters/PriorityFilters";
import SeverityFilters from "@/features/_filters/SeverityFilters";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PRIORITY_LABELS, SEVERITY_LABELS } from "@/utils/globalValues";

import type { FilterProps } from "../../pages/AnalyticsDashboard";
import { parseAppType } from "@/utils/helpers";

interface Props {
  filters: FilterProps;
  syncFilters: boolean;
}

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#06B6D4", "#8B5CF6"];

const AppTypeDonutCard: React.FC<Props> = ({ filters, syncFilters }) => {
  /* ---------------- Local Filters ---------------- */

  const [localFilters, setLocalFilters] = useState<FilterProps>({
    severity: [],
    priority: [],
    app_age_from: undefined,
    app_age_to: undefined,
  });

  /* ---------------- Sync Filters ---------------- */

  useEffect(() => {
    if (syncFilters) {
      setLocalFilters(filters);
    }
  }, [syncFilters, filters]);

  /* ---------------- API ---------------- */

  const { data, isLoading, error } = useGetApptypeSummaryQuery({
    severity:
      localFilters.severity?.length > 0
        ? localFilters.severity.join(",")
        : undefined,
    priority:
      localFilters.priority?.length > 0
        ? localFilters.priority.join(",")
        : undefined,
    app_age_from: localFilters.app_age_from,
    app_age_to: localFilters.app_age_to,
  });

  /* ---------------- Chart Data ---------------- */

  const chartData = useMemo(
    () =>
      data?.map((d) => ({
        name: d.app_type,
        value: d.total,
        ai: d.ai,
        privacy: d.privacy,
      })) ?? [],
    [data],
  );

  const totalApps = chartData.reduce((acc, cur) => acc + cur.value, 0);

  /* ---------------- Tooltip ---------------- */

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const d = payload[0].payload;

    return (
      <div className="bg-background border shadow-lg rounded-lg p-3 text-xs min-w-40">
        <div className="font-semibold text-sm mb-2 capitalize">
          {parseAppType(d.name)}
        </div>

        <div className="flex justify-between">
          <span>Total</span>
          <span className="font-medium">{d.value}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span>AI Apps</span>
          <span>{d.ai}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span>Privacy Apps</span>
          <span>{d.privacy}</span>
        </div>
      </div>
    );
  };

  /* ---------------- Badge Logic ---------------- */

  const visiblePriority = localFilters.priority.slice(0, 2);
  const remainingPriority = localFilters.priority.length - 2;

  const visibleSeverity = localFilters.severity.slice(0, 2);
  const remainingSeverity = localFilters.severity.length - 2;

  /* ---------------- UI ---------------- */

  return (
    <Card className="h-110 w-xl flex flex-col">
      <CardHeader>
        <CardTitle className="text-center">Application Type Summary</CardTitle>
      </CardHeader>

      <CardContent className="flex gap-6 flex-1 min-h-0 min-w-0">
        {/* Chart */}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-1">
              <Label>Application Age</Label>

              <DateRangeFilter
                from={localFilters.app_age_from}
                to={localFilters.app_age_to}
                onChange={({ from, to }) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    app_age_from: from,
                    app_age_to: to,
                  }))
                }
              />
            </div>

            {/* Priority */}

            <div className="flex flex-col gap-1">
              <Label>Priority</Label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex justify-between"
                  >
                    <span className="flex gap-1 flex-wrap">
                      {visiblePriority.length === 0 && (
                        <span className="text-muted-foreground">
                          Select priority
                        </span>
                      )}

                      {visiblePriority.map((p) => (
                        <Badge key={p} variant="secondary">
                          {PRIORITY_LABELS[p]}
                        </Badge>
                      ))}

                      {remainingPriority > 0 && (
                        <Badge variant="outline">+{remainingPriority}</Badge>
                      )}
                    </span>

                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <PriorityFilters
                  selectedValues={localFilters.priority}
                  onSubmit={(values) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      priority: values,
                    }))
                  }
                />
              </DropdownMenu>
            </div>

            {/* Severity */}

            <div className="flex flex-col gap-1">
              <Label>Severity</Label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex justify-between"
                  >
                    <span className="flex gap-1 flex-wrap">
                      {visibleSeverity.length === 0 && (
                        <span className="text-muted-foreground">
                          Select severity
                        </span>
                      )}

                      {visibleSeverity.map((s) => (
                        <Badge key={s} variant="secondary">
                          {SEVERITY_LABELS[s]}
                        </Badge>
                      ))}

                      {remainingSeverity > 0 && (
                        <Badge variant="outline">+{remainingSeverity}</Badge>
                      )}
                    </span>

                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <SeverityFilters
                  selectedValues={localFilters.severity}
                  onSubmit={(values) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      severity: values,
                    }))
                  }
                />
              </DropdownMenu>
            </div>
          </div>
          {isLoading ? (
            <BarChartSkeleton />
          ) : error ? (
            <div>{getApiErrorMessage(error)}</div>
          ) : (
            <div className="flex h-full items-center gap-8">
              {/* Donut Chart */}

              <div className="flex-1 min-w-0">
                <ChartContainer config={{}} className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip content={<CustomTooltip />} />

                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                      >
                        {chartData.map((entry, i) => (
                          <Cell
                            key={entry.name}
                            fill={COLORS[i % COLORS.length]}
                          />
                        ))}
                        <ChartLabel
                          position="center"
                          content={() => (
                            <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x="50%"
                                dy="-4"
                                className="fill-foreground text-lg font-bold"
                              >
                                {totalApps}
                              </tspan>

                              <tspan x="50%" dy="18" className="">
                                Total Apps
                              </tspan>
                            </text>
                          )}
                        />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Legend */}

              <div className="flex flex-col gap-3 min-w-40">
                {chartData.map((item, i) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-sm"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="capitalize text-muted-foreground">
                        {parseAppType(item.name)}
                      </span>
                    </div>

                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppTypeDonutCard;
