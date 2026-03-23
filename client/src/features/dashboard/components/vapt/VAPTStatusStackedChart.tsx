import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import { parseAppType, parseStatus } from "@/utils/helpers";
import { useGetVAPTSummaryPerStatusQuery } from "../../store/dashboardApiSlice";
import { Loader } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { appStatusChartConfig } from "@/lib/chartConfig";
import { APP_TYPE_COLOR_MAP_FG } from "@/utils/globalValues";

interface Props {
  filters?: any; // optional if you later add filters
}

// ---------- Custom Tooltip ----------
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-50 bg-background border shadow-lg rounded-xl p-3 text-xs">
      <div className="font-semibold mb-2 capitalize">{parseStatus(label)}</div>

      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex justify-between gap-4 text-xs">
          <span className="flex gap-2">
            <span
              className="h-3 w-3 rounded-sm"
              style={{
                backgroundColor:
                  APP_TYPE_COLOR_MAP_FG[entry.dataKey] ||
                  APP_TYPE_COLOR_MAP_FG["others"],
              }}
            />
            <span className="capitalize">{parseAppType(entry.dataKey)}</span>
          </span>
          <span className="font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// ---------- Component ----------
const VAPTStatusStackedChart: React.FC<Props> = () => {
  const { data, isLoading, error } = useGetVAPTSummaryPerStatusQuery({});

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader className="h-4 w-4 animate-spin" />
        Loading VAPT data...
      </div>
    );
  }

  if (error || !data) return <div>No data available</div>;

  // ---------- Extract dynamic keys ----------
  const allKeys = new Set<string>();

  data.forEach((item: any) => {
    Object.keys(item).forEach((key) => {
      if (key !== "status") {
        allKeys.add(key);
      }
    });
  });

  const appTypeKeys = Array.from(allKeys);

  return (
    <div className="flex-1 min-w-0 h-full">
      <ChartContainer config={appStatusChartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="status"
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) =>
                parseStatus(val)
                  .toLowerCase()
                  .replace(/^\w/, (c) => c.toUpperCase())
              }
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* ---------- Dynamic Bars ---------- */}
            {appTypeKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={
                  APP_TYPE_COLOR_MAP_FG[key] || APP_TYPE_COLOR_MAP_FG["others"]
                }
                radius={index === appTypeKeys.length - 1 ? [4, 4, 0, 0] : 0}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default VAPTStatusStackedChart;
