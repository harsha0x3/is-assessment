import React, { Suspense, useMemo, useState } from "react";
import { useGetPriorityWiseSummaryQuery } from "../store/dashboardApiSlice";
import { buildPriorityStackedData } from "@/lib/chartHelpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardLoader, SectionLoader } from "../components/Loaders";
import { getApiErrorMessage } from "@/utils/handleApiError";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AppStatusOptions,
  STATUS_COLOR_MAP_BG,
  STATUS_COLOR_MAP_FG,
} from "@/utils/globalValues";
import { Separator } from "@/components/ui/separator";
import type { AppStatuses } from "@/utils/globalTypes";

const PriorityStatusStackCard = React.lazy(
  () => import("../components/PriorityStatusStackCard"),
);
const VerticalWiseSummary = React.lazy(
  () => import("../components/VerticalWiseSummary"),
);
const SecondaryDashboard: React.FC = () => {
  const [priorityStatusFilter, setPriorityStatusFilter] =
    useState<string>("all");

  const {
    data: prioritySummary,
    isLoading: isLoadingPrioritySummary,
    error: prioritySummaryErr,
  } = useGetPriorityWiseSummaryQuery({ status_filter: priorityStatusFilter });

  const chartData = useMemo(
    () => (prioritySummary ? buildPriorityStackedData(prioritySummary) : []),
    [prioritySummary],
  );

  return (
    <div className="space-y-6 p-2 h-full overflow-auto">
      <Card className="px-0">
        <CardHeader className="w-full flex items-center justify-between mx-3">
          <CardTitle className="text-center">
            Priority Wise Status Summary
          </CardTitle>
          <div className="flex items-center gap-2">
            <p>Applications' Status</p>
            <Select
              value={priorityStatusFilter}
              onValueChange={(value) => setPriorityStatusFilter(value)}
            >
              <SelectTrigger
                id="app-status"
                className="disabled:border disabled:font-medium disabled:text-card-foreground disabled:opacity-100 disabled:cursor-auto"
                style={{
                  backgroundColor: priorityStatusFilter
                    ? STATUS_COLOR_MAP_BG[priorityStatusFilter as AppStatuses]
                    : undefined,
                  color: priorityStatusFilter
                    ? STATUS_COLOR_MAP_FG[priorityStatusFilter as AppStatuses]
                    : undefined,
                }}
              >
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="">
                <SelectItem value="all">All</SelectItem>
                {AppStatusOptions.map((s, idx) => {
                  return (
                    <>
                      <SelectItem
                        key={idx}
                        value={s.value}
                        style={{
                          color: STATUS_COLOR_MAP_FG[s.value],
                        }}
                        className=""
                      >
                        {s.label}
                      </SelectItem>
                      {idx !== AppStatusOptions.length && <Separator />}
                    </>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="grid grid-flow-col auto-cols-[380px] gap-4 overflow-x-auto">
          {isLoadingPrioritySummary && (
            <>
              <CardLoader />
              <CardLoader />
            </>
          )}

          {prioritySummaryErr && (
            <p>{getApiErrorMessage(prioritySummaryErr)}</p>
          )}

          <Suspense
            fallback={
              <>
                <CardLoader />
                <CardLoader />
              </>
            }
          >
            {chartData.map((item) => (
              <PriorityStatusStackCard key={item.priority} data={item} />
            ))}
          </Suspense>
        </CardContent>
      </Card>
      <Card>
        <Suspense
          fallback={
            <SectionLoader label="Loading vertical wise applications summary" />
          }
        >
          <VerticalWiseSummary />
        </Suspense>
      </Card>
    </div>
  );
};

export default SecondaryDashboard;
