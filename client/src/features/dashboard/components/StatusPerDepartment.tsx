// src/features/dashboard/components/StatusPerDepartment.tsx

import React, { useEffect, useMemo, useState } from "react";
import StatusPerDepartmentChart from "./StatusPerDepartmentChart";
import {
  useGetApplicationSummaryQuery,
  useGetStatusPerDepartmentQuery,
} from "../store/dashboardApiSlice";
import { SectionLoader } from "./Loaders";
import {
  ArrowRight,
  CheckIcon,
  Filter,
  FlagTriangleRight,
  Loader,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PRIORITY_LABELS,
  SEVERITY_LABELS,
  SLA_LABELS,
  STATUS_COLOR_MAP_FG,
} from "@/utils/globalValues";
import type { AppStatuses, DeptStatuses } from "@/utils/globalTypes";
import { parseStatus } from "@/utils/helpers";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildDonutData } from "@/lib/chartHelpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Props {
  slaFilter?: number;
}

const StatusCard: React.FC<{
  data: { name: string; count: number; percent: number };
  onClick: (status: AppStatuses) => void;
  activeStatus: AppStatuses;
}> = ({ data, onClick, activeStatus }) => {
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
      onClick={() => onClick(data.name as AppStatuses)}
      className={`spotlight-card relative overflow-hidden group/status border rounded-md shadow-card transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary bg-border/30 w-full ${activeStatus == data.name ? "border-ring/40 ring-3 ring-ring ring-offset-0" : ""}`}
    >
      <div
        tabIndex={0}
        className="flex w-full z-10 flex-col gap-1 px-3 py-2 group-hover:bg-card/90 border-none transition-all duration-300 ease-in-out group-hover:backdrop-blur-[20px]"
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
          <span className="text-xl font-semibold">{data.count}</span>

          <Button
            onClick={() => navigate(`/applications?appStatus=${data.name}`)}
            variant="link"
            className="
          items-center
          group/view_button
          opacity-100
            md:opacity-0
            md:group-hover/status:opacity-100
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

const StatusPerDepartment: React.FC<Props> = ({ slaFilter }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [appStatus, setAppStatus] = useState<AppStatuses>("in_progress");
  const [deptStatus, setDeptStatus] = useState<DeptStatuses>("in_progress");
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
  const [selectedSla, setSelectedSla] = useState<number>();
  const appSeverity = searchParams.get("appSeverity");
  const appPriority = searchParams.get("appPriority");
  const appSlaFilter = searchParams.get("appSlaFilter");

  const updateSearchParams = (
    updates: Record<string, string | number | null | undefined>,
  ) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null) newParams.delete(key);
      else newParams.set(key, String(value));
    });
    setSearchParams(newParams, { replace: true });
  };

  useEffect(() => {
    if (appSeverity) {
      setSelectedSeverity(appSeverity.split(","));
    }
    if (appPriority) {
      setSelectedPriority(appPriority.split(","));
    }
    if (appSlaFilter) {
      setSelectedSla(Number(appSlaFilter));
    }
  }, [appSeverity, appPriority, appSlaFilter]);

  const {
    data,
    isLoading,
    isError,
    refetch: refetchStatusPerDept,
  } = useGetStatusPerDepartmentQuery({
    app_status: appStatus,
    dept_status: deptStatus,
    sla_filter: slaFilter ?? selectedSla,
    app_sla: selectedSla,
    priority: appPriority ?? undefined,
    severity: appSeverity ?? undefined,
  });

  const {
    data: appsSummary,
    isLoading: isLoadingAppsSummary,
    error: appsSummaryErr,
    refetch: refetchAppsSummary,
  } = useGetApplicationSummaryQuery({
    severity: appSeverity ?? undefined,
    priority: appPriority ?? undefined,
    sla: Number(appSlaFilter) ?? undefined,
  });

  const statusCardData = useMemo(() => {
    if (!appsSummary) return null;

    const filtered = appsSummary.status_chart.filter((d) =>
      [
        "in_progress",
        "completed",
        "not_yet_started",
        "cancelled",
        "closed",
      ].includes(d.status),
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

  const toggleSeveritySelection = (value: string) => {
    setSelectedSeverity((prev) => {
      const updated = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];

      if (updated && updated?.length > 0) {
        updateSearchParams({ appSeverity: updated?.join(","), appPage: 1 });
      } else {
        updateSearchParams({ appSeverity: undefined, appPage: 1 });
      }

      return updated;
    });
  };
  const togglePrioritySelection = (value: string) => {
    setSelectedPriority((prev) => {
      const updated = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];

      if (updated?.length > 0) {
        updateSearchParams({ appPriority: updated.join(","), appPage: 1 });
      } else {
        updateSearchParams({ appPriority: undefined, appPage: 1 });
      }

      return updated;
    });
  };
  const toggleSlaSelection = (value: number) => {
    setSelectedSla(value);
    updateSearchParams({ appSlaFilter: value });
  };

  const FilterBadge: React.FC<{
    label: string;
    onRemove: () => void;
  }> = ({ label, onRemove }) => {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-0.5 text-xs">
        {label}
        <button onClick={onRemove} className="ml-1 hover:text-destructive">
          <X size={12} />
        </button>
      </span>
    );
  };

  const MainFilters: React.FC = () => {
    const hasFilters =
      selectedSeverity.length || selectedPriority.length || selectedSla;

    return (
      <div className="flex flex-col gap-2 w-full">
        {/* FILTER BUTTON ROW */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Severity */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Severity
                {selectedSeverity.length > 0 && (
                  <Badge variant="secondary">{selectedSeverity.length}</Badge>
                )}
                <Filter size={14} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
              {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => toggleSeveritySelection(value)}
                >
                  {label}
                  {selectedSeverity.includes(value) && (
                    <CheckIcon size={16} className="ml-auto" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {selectedSeverity.map((sev) => (
            <FilterBadge
              key={sev}
              label={`Severity: ${SEVERITY_LABELS[sev]}`}
              onRemove={() => toggleSeveritySelection(sev)}
            />
          ))}

          {/* Priority */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Priority
                {selectedPriority.length > 0 && (
                  <Badge variant="secondary">{selectedPriority.length}</Badge>
                )}
                <Filter size={14} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => togglePrioritySelection(value)}
                >
                  {label}
                  {selectedPriority.includes(value) && (
                    <CheckIcon size={16} className="ml-auto" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedPriority.map((p) => (
            <FilterBadge
              key={p}
              label={`Priority: ${PRIORITY_LABELS[p]}`}
              onRemove={() => togglePrioritySelection(p)}
            />
          ))}

          {/* SLA */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                App Age
                {selectedSla && <Badge variant="secondary">1</Badge>}
                <Filter size={14} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              {Object.entries(SLA_LABELS).map(([value, label]) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => toggleSlaSelection(Number(value))}
                >
                  {label}
                  {selectedSla == Number(value) && (
                    <CheckIcon size={16} className="ml-auto" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* CLEAR ALL */}
          {hasFilters && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedSeverity([]);
                setSelectedPriority([]);
                setSelectedSla(undefined);
                updateSearchParams({
                  appSeverity: undefined,
                  appPriority: undefined,
                  appSlaFilter: undefined,
                });
              }}
            >
              Clear all
            </Button>
          )}
        </div>

        {/* APPLIED FILTER BADGES */}
        <div className="flex flex-wrap gap-2"></div>
      </div>
    );
  };

  /* -----------------------------
   * RENDER
   * ----------------------------- */
  return (
    <React.Fragment>
      <CardHeader className="flex gap-2 px-3 py-3 border-rounded rounded-md border mr-4 ml-4">
        <CardTitle className="text-xl text-center">
          Application summary
        </CardTitle>
        <MainFilters />
      </CardHeader>
      <CardContent className="w-full flex flex-col lg:flex-row lg:gap-70 items-start">
        {/* Chart */}
        <StatusPerDepartmentChart
          color={STATUS_COLOR_MAP_FG[appStatus]}
          data={data.map((d) => ({
            department: d.department,
            count: d.count,
          }))}
        />

        {/* Summary + Cards */}
        <div className="w-120">
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

          {/* Status Cards Summary*/}
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
                    onClick={(status: AppStatuses) => {
                      setAppStatus(status);
                      switch (status) {
                        case "in_progress":
                          setDeptStatus("in_progress");
                          break;
                        case "completed":
                          setDeptStatus("cleared");
                          break;
                        case "cancelled":
                          setDeptStatus("closed");
                          break;
                        case "not_yet_started":
                          setDeptStatus("yet_to_connect");
                          break;
                        case "closed":
                          setDeptStatus("closed");
                          break;
                        default:
                          setDeptStatus("in_progress");
                      }
                    }}
                    activeStatus={appStatus}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </React.Fragment>
  );
};

export default StatusPerDepartment;
