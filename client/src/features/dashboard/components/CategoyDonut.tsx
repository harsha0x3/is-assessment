import { buildCategoryDonutData } from "@/lib/chartHelpers";
import type { CategoryStatusItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { categoryDonutConfig } from "@/lib/chartConfig";
import { Cell, Label, Pie, PieChart } from "recharts";
import { getLabelFromOptions, parseDept } from "@/utils/helpers";
import { DepartmentCategoryMap } from "@/utils/globalValues";

const CategoryDonut = ({
  category,
  statuses,
  total,
  departmentName,
}: {
  category: string;
  statuses: CategoryStatusItem[];
  total: number;
  departmentName: string;
}) => {
  const data = buildCategoryDonutData(statuses, total);
  console.log("DEPARTMENT", departmentName);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-lg font-medium capitalize">
          {getLabelFromOptions(
            category,
            DepartmentCategoryMap[parseDept(departmentName).toLowerCase()],
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex justify-center">
        <ChartContainer
          config={categoryDonutConfig}
          className=" h-60 w-full max-w-100 mx-auto"
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
                      className="fill-muted-foreground text-xs"
                    >
                      Total
                    </tspan>
                    <tspan
                      x="50%"
                      dy="1.2em"
                      className="fill-foreground text-lg font-semibold"
                    >
                      {total}
                    </tspan>
                  </text>
                )}
              />

              {data.map((entry) => {
                console.log("ENTRY", entry);
                return (
                  <Cell
                    key={entry.name}
                    fill={categoryDonutConfig[entry.name.toLowerCase()].color}
                  />
                );
              })}
            </Pie>

            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, { payload }) => (
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">
                        {categoryDonutConfig[name]?.label}
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

        {/* Status legend/cards */}
        {/* <div className="grid grid-cols-2 gap-3">
          {data.map((item) => (
            <StatusCard
              key={item.name}
              data={{
                name: item.name,
                count: item.count,
                percent: item.value,
              }}
            />
          ))}
        </div> */}
      </CardContent>
    </Card>
  );
};
export default CategoryDonut;
