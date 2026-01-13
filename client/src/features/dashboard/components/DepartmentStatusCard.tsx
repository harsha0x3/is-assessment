import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseStatus } from "@/utils/helpers";
import { STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig: ChartConfig = {
  count: {
    label: "Count",
  },
  ...Object.fromEntries(
    Object.entries(STATUS_COLOR_MAP_FG).map(([status, color]) => [
      status,
      {
        label: parseStatus(status),
        color,
      },
    ])
  ),
};

interface Props {
  department: string;
  statuses: { status: string; count: number }[];
}

const DepartmentStatusCard: React.FC<Props> = ({ department, statuses }) => {
  return (
    <Card className="h-full px-0 w-md">
      <CardHeader className="pb-2 px-0">
        <CardTitle className="text-sm font-medium text-center capitalize">
          {parseStatus(department)}
        </CardTitle>
      </CardHeader>

      <CardContent className="h-64 w-md px-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statuses}>
              <XAxis
                dataKey="status"
                tickFormatter={parseStatus}
                tick={{ fontSize: 9 }}
                interval={0}
              />
              <YAxis allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" barSize={20} radius={[4, 4, 0, 0]}>
                {statuses.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLOR_MAP_FG[entry.status]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default DepartmentStatusCard;
