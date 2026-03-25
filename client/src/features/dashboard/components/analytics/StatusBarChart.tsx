import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
} from "recharts";

import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import { parseStatus } from "@/utils/helpers";
import { useNavigate } from "react-router-dom";
import type { FilterProps } from "../../pages/AnalyticsDashboard";
import { appStatusChartConfig } from "@/lib/chartConfig";
import type { AppStatuses } from "@/utils/globalTypes";
import { useLazyGetStatusPerDepartmentQuery } from "../../store/dashboardApiSlice";
import { Loader } from "lucide-react";

interface Props {
  data: any;
  isLoading: boolean;
  filters: FilterProps;
}

interface CustomXAxisTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
}

const CustomXAxisTick: React.FC<CustomXAxisTickProps> = ({
  x = 0,
  y = 0,
  payload,
}) => {
  if (!payload?.value) return null;

  const label = parseStatus(payload.value)
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

  const words = label.split(" ");

  let line1 = "";
  let line2 = "";

  if (words.length <= 2) {
    line1 = label;
  } else {
    const mid = Math.ceil(words.length / 2);
    line1 = words.slice(0, mid).join(" ");
    line2 = words.slice(mid).join(" ");
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="#666" fontSize={13} fontWeight={500}>
        <tspan x="0" dy="0">
          {line1}
        </tspan>
        {line2 && (
          <tspan x="0" dy="1.2em">
            {line2}
          </tspan>
        )}
      </text>
    </g>
  );
};

const StatusBarChart: React.FC<Props> = ({ data, isLoading, filters }) => {
  const navigate = useNavigate();
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  const [fetchDeptStatus, { data: deptStatusData, isFetching: isDeptLoading }] =
    useLazyGetStatusPerDepartmentQuery();

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const status = payload[0].payload.status;
    const count = payload[0].value;

    return (
      <div className="min-w-50 bg-background border shadow-lg rounded-xl p-3 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-2 mb-2">
          <span className="font-semibold capitalize text-sm">
            {parseStatus(status)}
          </span>

          <span className="font-bold text-primary text-sm">{count}</span>
        </div>

        {/* Loading */}
        {isDeptLoading && (
          <div className="flex items-center h-fit gap-2 text-muted-foreground text-xs">
            <Loader className="h-3 w-3 animate-spin" />
            Loading departments...
          </div>
        )}

        {/* Department Breakdown */}
        {deptStatusData && deptStatusData.length > 0 && (
          <div className="space-y-1 overflow-auto">
            {deptStatusData.map((dept) => (
              <div
                key={dept.department_id}
                className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-muted/50 transition"
              >
                <span className="capitalize">{dept.department}</span>

                <span className="font-semibold">{dept.count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {deptStatusData && deptStatusData.length === 0 && (
          <div className="text-muted-foreground text-xs text-center py-2">
            No department data
          </div>
        )}
      </div>
    );
  };

  const getDeptStatusFromAppStatus = (status: string) => {
    switch (status) {
      case "completed":
        return "cleared";
      case "not_yet_started":
        return "yet_to_connect";
      default:
        return status;
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <div className="flex-1 min-w-0">
      <ChartContainer config={appStatusChartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.status_chart}
            margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="status"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              interval={0}
              tick={<CustomXAxisTick />}
              angle={-20}
            />

            <ChartTooltip cursor={false} content={<CustomTooltip />} />

            <Bar
              dataKey="count"
              radius={6}
              className="cursor-pointer"
              onClick={(data) => {
                navigate(
                  `/applications?appStatus=${data.status === "all" ? null : data.status}&appAgeFrom=${filters?.app_age_from ? filters.app_age_from : ""}&appAgeTo=${filters?.app_age_to ? filters.app_age_to : ""}`,
                );
              }}
              onMouseEnter={(barData: any) => {
                const status = barData?.payload?.status;
                if (!status || hoveredStatus === status) return;

                setHoveredStatus(status);

                fetchDeptStatus(
                  {
                    app_status: status,
                    dept_status: getDeptStatusFromAppStatus(status),
                    app_age_from: filters?.app_age_from
                      ? filters.app_age_from
                      : undefined,
                    app_age_to: filters?.app_age_to
                      ? filters.app_age_to
                      : undefined,
                    severity: filters?.severity?.length
                      ? filters.severity.join(",")
                      : undefined,
                    priority: filters?.priority?.length
                      ? filters.priority.join(",")
                      : undefined,
                  },
                  true,
                );
              }}
              onMouseLeave={() => setHoveredStatus(null)}
            >
              {data.status_chart.map((entry: any) => (
                <Cell
                  key={entry.status}
                  fill={STATUS_COLOR_MAP_FG[entry.status as AppStatuses]}
                />
              ))}

              <LabelList
                dataKey="count"
                position="top"
                style={{ fontSize: 14, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default StatusBarChart;
