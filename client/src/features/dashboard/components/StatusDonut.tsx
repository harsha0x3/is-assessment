import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DonutData } from "../types";
import { PieChart, Pie, Cell, Label } from "recharts";
import { appStatusChartConfig } from "@/lib/chartConfig";
const StatusDonut = ({
  data,
  total_count,
}: {
  data: DonutData[];
  total_count: number;
}) => {
  return (
    <div className="">
      <ChartContainer
        config={appStatusChartConfig}
        className="mx-auto aspect-square max-h-100"
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={70}
            outerRadius={100}
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
                fill={appStatusChartConfig[entry.name].color}
              />
            ))}
          </Pie>

          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, { payload }) => (
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">
                      {appStatusChartConfig[name].label}
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
    </div>
  );
};

export default StatusDonut;
