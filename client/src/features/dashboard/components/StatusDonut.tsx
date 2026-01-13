import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DonutData } from "../types";
import { PieChart, Pie, Cell, Label } from "recharts";
import { donutChartConfig } from "@/lib/chartConfig";
import { parseStatus } from "@/utils/helpers";
import { STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import type { AppStatuses } from "@/utils/globalTypes";

const StatusCard: React.FC<{
  data: { name: string; count: number; percent: number };
}> = ({ data }) => {
  return (
    <div className="flex flex-col gap-0.5 border px-2 py-1 rounded-md shadow-card">
      <p className="text-muted-foreground font-medium capitalize flex items-center gap-2">
        {parseStatus(data.name)}

        <span
          className="w-4 h-4 rounded-sm border"
          style={{
            backgroundColor: STATUS_COLOR_MAP_FG[data.name as AppStatuses],
          }}
        />
      </p>
      <span className="text-lg font-medium">{data.count}</span>
    </div>
  );
};

const StatusDonut = ({
  data,
  total_count,
}: {
  data: DonutData[];
  total_count: number;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-lg">
          Overall Application Statuses
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-2">
        <ChartContainer
          config={donutChartConfig}
          className="mx-auto aspect-square max-h-60"
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={60}
              outerRadius={90}
              labelLine={false}
            >
              {/* Center label */}
              <Label
                position="center"
                content={() => (
                  <text x="50%" y="50%" textAnchor="middle">
                    <tspan
                      x="50%"
                      dy="-0.3em"
                      className="fill-muted-foreground text-sm"
                    >
                      Total Apps
                    </tspan>
                    <tspan
                      x="50%"
                      dy="1.2em"
                      className="fill-foreground text-xl font-semibold"
                    >
                      {total_count}
                    </tspan>
                  </text>
                )}
              />

              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={donutChartConfig[entry.name].color}
                />
              ))}
            </Pie>

            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, { payload }) => (
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">
                        {donutChartConfig[name].label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {payload.count} apps • {value}%
                      </span>
                    </div>
                  )}
                />
              }
            />
          </PieChart>
        </ChartContainer>
        <div className="grid grid-cols-2 gap-3 items-center">
          {data.map((item) => (
            <StatusCard
              data={{
                name: item.name,
                count: item.count,
                percent: item.value,
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusDonut;
