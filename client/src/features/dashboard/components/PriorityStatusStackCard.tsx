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
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { parseStatus } from "@/utils/helpers";
import { PriorityValueMap, STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import { useNavigate } from "react-router-dom";

type StatusKey = keyof typeof STATUS_COLOR_MAP_FG;

interface Props {
  data: Record<string, number | string>; // Single priority
}

const chartConfig: ChartConfig = {
  count: { label: "Count" },
  ...Object.fromEntries(
    Object.entries(STATUS_COLOR_MAP_FG).map(([status, color]) => [
      status,
      { label: parseStatus(status), color },
    ]),
  ),
};

const PriorityStatusBarCard: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();

  // Convert priority object to array for stacked bar
  const chartData = Object.keys(data)
    .filter(
      (k): k is StatusKey =>
        k !== "priority" && k !== "total" && k in STATUS_COLOR_MAP_FG,
    )
    .map((status) => ({
      status,
      count: data[status] as number,
    }));

  return (
    <Card className="h-full px-0 w-md gap-2">
      <CardHeader className="pb-2 px-0">
        <CardTitle className="text-sm text-center capitalize">
          {data.priority} Priority
        </CardTitle>
      </CardHeader>

      <CardContent className="h-64 w-md px-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
            >
              <XAxis
                dataKey="status"
                tickFormatter={(v) =>
                  parseStatus(v)
                    .toLowerCase()
                    .replace(/^\w/, (c) => c.toUpperCase())
                }
                tick={{ fontSize: 9 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={40}
              />

              <YAxis allowDecimals={false} domain={[0, "dataMax + 2"]} />
              <Bar
                dataKey="count"
                barSize={20}
                radius={[4, 4, 0, 0]}
                className="hover:cursor-pointer"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLOR_MAP_FG[entry.status as StatusKey]}
                    onClick={() =>
                      navigate(
                        `/applications?appPriority=${PriorityValueMap[String(data.priority).toLowerCase()]}&appStatus=${entry.status}`,
                      )
                    }
                  />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  style={{ fontSize: 10, color: "white" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PriorityStatusBarCard;
