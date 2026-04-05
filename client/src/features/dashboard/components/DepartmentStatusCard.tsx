import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseDept, parseStatus } from "@/utils/helpers";
import { STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import {
  ChartContainer,
  // ChartTooltip,
  // ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { AppStatuses } from "@/utils/globalTypes";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import Hint from "@/components/ui/hint";

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
    ]),
  ),
};

interface Props {
  department: string;
  statuses: { status: string; count: number }[];
  deptId: number;
  deptStatusFilter?: string;
  appAgeFrom?: string;
  appAgeTo?: string;
  assignedApps?: number;
  totalApps?: number;
}

const DepartmentStatusCard: React.FC<Props> = ({
  department,
  statuses,
  deptId,
  deptStatusFilter,
  appAgeFrom,
  appAgeTo,
  assignedApps,
  // totalApps,
}) => {
  const navigate = useNavigate();
  return (
    <div className="p-2">
      <Card className="h-96 px-0 w-lg gap-1 hover:shadow-lg hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-primary bg-border/30 transition-all duration-200 ease-in">
        <CardHeader className="pb-2 flex items-center justify-between px-3">
          <div />
          <CardTitle className="text-md font-semibold text-center capitalize">
            {parseDept(department)}
          </CardTitle>
          <Hint label="Assigned Applications">
            <span>
              <Badge>{assignedApps}</Badge>
            </span>
          </Hint>
        </CardHeader>

        <CardContent className="h-full w-full px-0">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statuses}
                margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
              >
                <XAxis
                  dataKey="status"
                  tickFormatter={(value) =>
                    parseStatus(value)
                      .toLowerCase()
                      .replace(/^\w/, (c) => c.toUpperCase())
                  }
                  tick={{ fontSize: 12, fontWeight: 700 }}
                  interval={0}
                  angle={-20}
                  tickMargin={10}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, assignedApps ?? "dataMax + 2"]}
                />
                {/* <ChartTooltip content={<div>Show Details</div>} /> */}

                <Bar
                  dataKey="count"
                  barSize={20}
                  radius={[4, 4, 0, 0]}
                  className="hover:cursor-pointer"
                  onClick={(data) => {
                    navigate(
                      `/applications?deptFilterId=${deptId}&deptStatus=${data.status}&view=${department}&appStatus=${deptStatusFilter === "all" ? null : deptStatusFilter}&&appAgeFrom=${appAgeFrom ? appAgeFrom : ""}&appAgeTo=${appAgeTo ? appAgeTo : ""}`,
                    );
                  }}
                >
                  {statuses.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLOR_MAP_FG[entry.status as AppStatuses]}
                    />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    style={{ fontSize: 13, fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentStatusCard;
