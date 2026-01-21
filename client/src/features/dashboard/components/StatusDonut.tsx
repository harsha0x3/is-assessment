import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StatusCard: React.FC<{
  data: { name: string; count: number; percent: number };
}> = ({ data }) => {
  const navigate = useNavigate();
  return (
    <div
      tabIndex={0}
      className="
        group/status
        flex flex-col gap-1
        border rounded-md px-3 py-2
        shadow-card
        transition-all
        hover:shadow-md hover:-translate-y-0.5
        focus-visible:ring-2 focus-visible:ring-primary
      "
    >
      {/* Title */}
      <p className="font-medium capitalize flex items-center gap-2">
        {parseStatus(data.name)}
        <span
          className="w-3.5 h-3.5 rounded-sm border"
          style={{
            backgroundColor: STATUS_COLOR_MAP_FG[data.name as AppStatuses],
          }}
        />
      </p>

      {/* Count + Action */}
      <div className="flex items-center justify-between">
        <span className="text-xl font-semibold">{data.count}</span>

        <Button
          onClick={() => navigate(`/applications?appStatus=${data.name}`)}
          variant="link"
          className="
          items-center
          group/view_button
          opacity-100
            md:opacity-0
            md:hidden
            md:group-hover/status:opacity-100
            md:group-hover/status:flex
            md:group-hover/status:pointer-events-auto
            md:group-focus-visible/status:opacity-100
            md:group-focus-visible/status:pointer-events-auto
            transition-opacity
            text-sm
            p-0 h-auto
          "
        >
          <p>View details</p>{" "}
          <ArrowRight className="opacity-0 group-hover/view_button:opacity-100 transition-opacity" />
        </Button>
      </div>
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
    <>
      <CardHeader>
        <CardTitle className="text-center text-lg">
          Overall Application Statuses
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-2">
        <ChartContainer
          config={donutChartConfig}
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
    </>
  );
};

export default StatusDonut;
