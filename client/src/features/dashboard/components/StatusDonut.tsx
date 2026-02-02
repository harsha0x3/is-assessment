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
import { ArrowRight, FlagTriangleRight, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLazyExportApplicationsCSVQuery } from "../store/exportsApiSlice";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const StatusCard: React.FC<{
  data: { name: string; count: number; percent: number };
}> = ({ data }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const all = document.querySelectorAll(".spotlight-card");
    const handleMouseMove = (ev: MouseEvent) => {
      all.forEach((e) => {
        const blob = e.querySelector(".blob") as HTMLElement;
        const fblob = e.querySelector(".fake-blob") as HTMLElement;

        if (!blob || !fblob) return;

        const rec = fblob.getBoundingClientRect();

        blob.style.opacity = "1";

        blob.animate(
          [
            {
              transform: `translate(${ev.clientX - rec.left - rec.width / 2}px,  ${ev.clientY - rec.top - rec.height / 2}px)`,
            },
          ],
          {
            duration: 300,
            fill: "forwards",
          },
        );
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  return (
    <div
      className="spotlight-card relative overflow-hidden group/status  
        border rounded-md
        shadow-card
        transition-all
        duration-300
        ease-in-out
        hover:shadow-md hover:-translate-y-0.5
        focus-visible:ring-2 focus-visible:ring-primary bg-border/30"
    >
      <div
        tabIndex={0}
        className="flex z-10 flex-col gap-1 px-3 py-2 group-hover:bg-card/90 max-w-80 border-none transition-all duration-300 ease-in-out group-hover:backdrop-blur-[20px]"
      >
        {/* Title */}
        <p className="font-medium capitalize flex items-center gap-2">
          {parseStatus(data.name)}
          {data.name === "go_live" ? (
            <FlagTriangleRight
              fill={STATUS_COLOR_MAP_FG[data.name as AppStatuses]}
              className="w-5 h-5"
            />
          ) : (
            <span
              className="w-3.5 h-3.5 rounded-sm border"
              style={{
                backgroundColor: STATUS_COLOR_MAP_FG[data.name as AppStatuses],
              }}
            />
          )}
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
      <div className="blob pointer-events-none absolute top-0 left-0 size-10 rounded-full bg-primary/60 opacity-0 blur-lg transition-all duration-300 ease-in-out dark:primary/60" />
      <div className="fake-blob absolute top-0 pointer-events-none left-0 size-10 rounded-full" />
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
  const [trigger, { isLoading }] = useLazyExportApplicationsCSVQuery();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  return (
    <div className="">
      <CardHeader>
        <div className="w-full flex items-center">
          <CardTitle className="text-center text-lg flex-1">
            Overall Application Status Summary
          </CardTitle>
          <Button
            onClick={async () => {
              try {
                setIsDownloading(true);
                const blob = await trigger().unwrap();

                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");

                link.href = url;
                link.download = "is_assessment_all_applications.csv";

                document.body.appendChild(link);
                link.click();

                link.remove();
                window.URL.revokeObjectURL(url);
              } catch (error) {
                toast.error(
                  getApiErrorMessage(error) ?? "Error downloading the report",
                );
              } finally {
                setIsDownloading(false);
              }
            }}
            disabled={isLoading || isDownloading}
          >
            {isLoading || isDownloading ? (
              <span className="flex items-center">
                <Loader className="animnate-spin" />
              </span>
            ) : (
              "Export"
            )}
          </Button>
        </div>
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
              key={item.name}
              data={{
                name: item.name,
                count: item.count,
                percent: item.value,
              }}
            />
          ))}
        </div>
      </CardContent>
    </div>
  );
};

export default StatusDonut;
