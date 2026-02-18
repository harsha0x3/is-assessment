// src/features/dashboard/components/StatusPerDepartmentChart.tsx

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { parseDept } from "@/utils/helpers";

const chartConfig: ChartConfig = {
  count: {
    label: "Applications",
  },
};

// const COLORS = [
//   "#3b82f6", // blue-500
//   "#22c55e", // green-500
//   "#f97316", // orange-500
//   "#ef4444", // red-500
//   "#a855f7", // purple-500
//   "#14b8a6", // teal-500
// ];

interface Props {
  data: {
    department: string;
    count: number;
  }[];
  color: string;
}

const StatusPerDepartmentChart: React.FC<Props> = ({ data, color }) => {
  return (
    <div className="h-140 w-3xl">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
          >
            <XAxis
              dataKey="department"
              tickFormatter={(v) => parseDept(v)}
              tick={{ fontSize: 10 }}
              interval={0}
              tickMargin={8}
            />
            <YAxis allowDecimals={false} />
            <Bar dataKey="count" barSize={40} radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={color} />
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
    </div>
  );
};

export default StatusPerDepartmentChart;
