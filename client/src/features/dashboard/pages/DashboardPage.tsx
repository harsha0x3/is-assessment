import React, { Suspense, useMemo } from "react";
import {
  useGetDashboardSummaryQuery,
  useGetPriorityWiseSummaryQuery,
} from "../store/dashboardApiSlice";
import { buildDonutData, buildPriorityStackedData } from "@/lib/chartHelpers";
import { Loader } from "lucide-react";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StatusDonut = React.lazy(() => import("../components/StatusDonut"));
const DepartmentStatusCard = React.lazy(
  () => import("../components/DepartmentStatusCard"),
);
const PriorityStatusStackCard = React.lazy(
  () => import("../components/PriorityStatusStackCard"),
);
const VerticalWiseSummary = React.lazy(
  () => import("../components/VerticalWiseSummary"),
);

const SectionLoader = ({ label }: { label?: string }) => (
  <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground">
    <Loader className="h-4 w-4 animate-spin" />
    {label ?? "Loading..."}
  </div>
);

const CardLoader = () => (
  <Card className="h-72 w-95 flex items-center justify-center">
    <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
  </Card>
);

const DashboardPage: React.FC = () => {
  // 🔹 Lazy-loaded components

  const { data, isLoading, error } = useGetDashboardSummaryQuery();
  const {
    data: prioritySummary,
    isLoading: isLoadingPrioritySummary,
    error: prioritySummaryErr,
  } = useGetPriorityWiseSummaryQuery();

  const chartData = useMemo(
    () => (prioritySummary ? buildPriorityStackedData(prioritySummary) : []),
    [prioritySummary],
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader className="animate-spin" /> Loading...
      </div>
    );
  }

  if (error) {
    return <p>{getApiErrorMessage(error) ?? "Error fetching summary"}</p>;
  }

  if (!data) return null;

  return (
    <div className="space-y-6 p-2 h-full overflow-auto">
      {/* ---------- Application-wide summary ---------- */}
      <Card>
        <Suspense
          fallback={<SectionLoader label="Loading application summary…" />}
        >
          {!isLoading && data && (
            <StatusDonut
              data={buildDonutData(
                data.application_summary.status_chart,
                data.application_summary.total_apps,
              )}
              total_count={data.application_summary.total_apps}
            />
          )}
        </Suspense>

        {isLoading && <SectionLoader label="Loading application summary…" />}
        {error && <p>{getApiErrorMessage(error)}</p>}
      </Card>

      {/* ---------- Department-wise summary ---------- */}
      <Card className="px-0">
        <CardHeader className="px-0">
          <CardTitle className="text-center">
            Department Wise Status Summary
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-flow-col auto-cols-[380px] gap-4 overflow-x-auto">
          <Suspense
            fallback={
              <>
                <CardLoader />
                <CardLoader />
                <CardLoader />
              </>
            }
          >
            {data?.department_summary.departments.map((dept) => (
              <DepartmentStatusCard
                key={dept.department}
                department={dept.department}
                deptId={dept.department_id}
                statuses={dept.statuses}
              />
            ))}
          </Suspense>
        </CardContent>
      </Card>

      <Card className="px-0">
        <CardHeader>
          <CardTitle className="text-center">
            Priority Wise Status Summary
          </CardTitle>
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

export default DashboardPage;
