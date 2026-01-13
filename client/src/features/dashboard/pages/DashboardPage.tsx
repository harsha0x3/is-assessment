import React, { useMemo } from "react";
import { useGetDashboardStatsQuery } from "../store/dashboardApiSlice";
import StatusDonut from "../components/StatusDonut";
import DepartmentStatusCard from "../components/DepartmentStatusCard";
import { buildDonutData } from "@/lib/chartHelpers";
import { Loader } from "lucide-react";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DashboardPage: React.FC = () => {
  const { data, isLoading, error } = useGetDashboardStatsQuery();

  const appDonutData = useMemo(() => {
    if (!data) return [];

    const { status_chart, total_apps } = data.application_stats;
    return buildDonutData(status_chart, total_apps);
  }, [data]);

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
      <StatusDonut
        data={appDonutData}
        total_count={data.application_stats.total_apps}
      />

      {/* ---------- Department-wise stats ---------- */}
      <Card className="px-0">
        <CardHeader className="px-0">
          <CardTitle className="text-center">
            Department Wise Completions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-flow-col auto-cols-[380px] overflow-x-auto">
          {data.department_stats.departments.map((dept) => (
            <DepartmentStatusCard
              key={dept.department}
              department={dept.department}
              statuses={dept.statuses}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
