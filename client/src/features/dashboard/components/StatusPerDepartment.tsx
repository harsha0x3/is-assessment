// src/features/dashboard/components/StatusPerDepartment.tsx

import React, { useEffect, useMemo } from "react";
import StatusPerDepartmentChart from "./StatusPerDepartmentChart";
import {
  useGetApplicationSummaryQuery,
  useGetStatusPerDepartmentQuery,
} from "../store/dashboardApiSlice";
import { SectionLoader } from "./Loaders";
import { ArrowRight, FlagTriangleRight, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import type { AppStatuses } from "@/utils/globalTypes";
import { parseStatus } from "@/utils/helpers";
import { useNavigate } from "react-router-dom";
import { CardContent } from "@/components/ui/card";
import { buildDonutData } from "@/lib/chartHelpers";

interface Props {
  appStatus: string;
  deptStatus: string;
  slaFilter?: number;
}

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
        focus-visible:ring-2 focus-visible:ring-primary bg-border/30 w-full"
    >
      <div
        tabIndex={0}
        className="flex w-full z-10 flex-col gap-1 px-3 py-2 group-hover:bg-card/90 max-w-80 border-none transition-all duration-300 ease-in-out group-hover:backdrop-blur-[20px]"
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
        <div className="flex w-full items-center justify-between">
          <span className="text-xl font-semibold flex-1">{data.count}</span>

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

const StatusPerDepartment: React.FC<Props> = ({
  appStatus,
  slaFilter,
  deptStatus,
}) => {
  const {
    data,
    isLoading,
    isError,
    refetch: refetchStatusPerDept,
  } = useGetStatusPerDepartmentQuery({
    app_status: appStatus,
    dept_status: deptStatus,
    sla_filter: slaFilter,
  });

  const {
    data: appsSummary,
    isLoading: isLoadingAppsSummary,
    error: appsSummaryErr,
    refetch: refetchAppsSummary,
  } = useGetApplicationSummaryQuery();

  const statusCardData = useMemo(() => {
    if (!appsSummary) return null;

    const filtered = appsSummary.status_chart.filter((d) =>
      ["in_progress", "completed"].includes(d.status),
    );

    return buildDonutData(filtered, appsSummary.total_apps);
  }, [appsSummary]);

  /* -----------------------------
   * PRIMARY STATE: Chart
   * ----------------------------- */
  if (isLoading) {
    return <SectionLoader label="Loading status count per department" />;
  }

  if (isError || !data) {
    return (
      <div className="h-80 flex flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          Failed to load status per department.
        </p>
        <Button size="sm" onClick={refetchStatusPerDept}>
          Retry
        </Button>
      </div>
    );
  }

  /* -----------------------------
   * RENDER
   * ----------------------------- */
  return (
    <CardContent className="w-full grid grid-cols-1 sm:grid-cols-2 gap-20 items-center">
      {/* Chart */}
      <StatusPerDepartmentChart
        data={data.map((d) => ({
          department: d.department,
          count: d.count,
        }))}
      />

      {/* Summary + Cards */}
      <div className="w-2/3">
        {/* Loading summary */}
        {isLoadingAppsSummary && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader className="animate-spin w-4 h-4" />
            Loading application summary…
          </div>
        )}

        {/* Summary error */}
        {appsSummaryErr && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Failed to load application summary.
            </p>
            <Button size="sm" variant="outline" onClick={refetchAppsSummary}>
              Retry
            </Button>
          </div>
        )}

        {/* Summary success */}
        {statusCardData && appsSummary && (
          <div className="space-y-4">
            <p>
              <strong className="text-lg">Total Apps: </strong>
              {appsSummary.total_apps}
            </p>

            <div className="space-y-3">
              {statusCardData.map((item) => (
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
          </div>
        )}
      </div>
    </CardContent>
  );
};

export default StatusPerDepartment;
