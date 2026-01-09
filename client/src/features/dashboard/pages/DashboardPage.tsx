import React, { useMemo } from "react";
import { useGetOverallStatsQuery } from "../store/dashboardApiSlice";
import type { AppStatusStats, DashboardStats, DonutData } from "../types";
import StatusDonut from "../components/StatusDonut";
import { Loader } from "lucide-react";
import { getApiErrorMessage } from "@/utils/handleApiError";

const DashboardPage = () => {
  const { data, isLoading, error } = useGetOverallStatsQuery();

  const buildDonutData = (stats: DashboardStats): DonutData[] => {
    const total = stats.total_apps;

    return Object.entries(stats.app_statuses).map(([status, count]) => ({
      name: status as keyof AppStatusStats,
      count,
      value: total > 0 ? +((count / total) * 100).toFixed(1) : 0,
    }));
  };

  const charData: { donutData: DonutData[] } | undefined = useMemo(() => {
    if (data) {
      const donutData = buildDonutData(data.data);
      return {
        donutData,
      };
    }
  }, [data]);

  return (
    <div className="p-2">
      {isLoading ? (
        <div>
          <Loader className="animate-spin" /> Loading ....
        </div>
      ) : error ? (
        <p>{getApiErrorMessage(error) ?? "Error Fetching Statistics"}</p>
      ) : charData && data ? (
        <StatusDonut
          data={charData.donutData}
          total_count={data?.data.total_apps}
        />
      ) : (
        <div>Loading</div>
      )}
    </div>
  );
};

export default DashboardPage;
