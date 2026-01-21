import React, { Suspense, useMemo } from "react";
import {
  useGetDashboardStatsQuery,
  useGetPriorityWiseStatsQuery,
} from "../store/dashboardApiSlice";
import { buildDonutData, buildPriorityStackedData } from "@/lib/chartHelpers";
import { Loader } from "lucide-react";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const StatusDonut = React.lazy(() => import("../components/StatusDonut"));
  const DepartmentStatusCard = React.lazy(
    () => import("../components/DepartmentStatusCard"),
  );
  const PriorityStatusStackCard = React.lazy(
    () => import("../components/PriorityStatusStackCard"),
  );
  const { data, isLoading, error } = useGetDashboardStatsQuery();
  const {
    data: priorityStats,
    isLoading: isLoadingPriorityStats,
    error: priorityStatsErr,
  } = useGetPriorityWiseStatsQuery();

  const chartData = useMemo(
    () => (priorityStats ? buildPriorityStackedData(priorityStats) : []),
    [priorityStats],
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader className="animate-spin" /> Loading...
      </div>
    );
  }

  if (error) {
    return <p>{getApiErrorMessage(error) ?? "Error fetching stats"}</p>;
  }

  if (!data) return null;

  return (
    <div className="space-y-6 p-2 h-full overflow-auto">
      {/* ---------- Application-wide stats ---------- */}
      <Card>
        <Suspense
          fallback={<SectionLoader label="Loading application stats…" />}
        >
          {!isLoading && data && (
            <StatusDonut
              data={buildDonutData(
                data.application_stats.status_chart,
                data.application_stats.total_apps,
              )}
              total_count={data.application_stats.total_apps}
            />
          )}
        </Suspense>

        {isLoading && <SectionLoader label="Loading application stats…" />}
        {error && <p>{getApiErrorMessage(error)}</p>}
      </Card>

      {/* ---------- Department-wise stats ---------- */}
      <Card className="px-0">
        <CardHeader className="px-0">
          <CardTitle className="text-center">
            Department Wise Status Split
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
            {data?.department_stats.departments.map((dept) => (
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
            Priority Wise Status Split
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-flow-col auto-cols-[380px] gap-4 overflow-x-auto">
          {isLoadingPriorityStats && (
            <>
              <CardLoader />
              <CardLoader />
            </>
          )}

          {priorityStatsErr && <p>{getApiErrorMessage(priorityStatsErr)}</p>}

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
    </div>
  );
};

export default DashboardPage;
