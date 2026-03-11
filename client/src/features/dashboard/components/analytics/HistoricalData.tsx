import React, { useMemo } from "react";
import { useGetApplicationSummaryQuery } from "../../store/dashboardApiSlice";
import { buildDonutData } from "@/lib/chartHelpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppStatusCard from "../AppStatusCard";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { Skeleton } from "@/components/ui/skeleton";

const HistoricalData: React.FC = () => {
  const { data, isLoading, error } = useGetApplicationSummaryQuery();

  const statusCardData = useMemo(() => {
    if (data) {
      const donutData = buildDonutData(data.status_chart, data.total_apps);
      const result = donutData.filter((d) =>
        [
          "in_progress",
          "completed",
          "closed",
          "new_request",
          "not_yet_started",
        ].includes(d.name),
      );
      return result;
    }
    return undefined;
  }, [data]);

  return (
    <Card className="w-md flex flex-col max-h-148 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">
          Historical Data
        </CardTitle>
        {data && (
          <h3 className="text-md font-semibold">
            Total Applications:{" "}
            <span className="font-bold text-lg">{data.total_apps}</span>
          </h3>
        )}
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        ) : error ? (
          <div>{getApiErrorMessage(error)}</div>
        ) : (
          statusCardData &&
          statusCardData.map((item) => (
            <AppStatusCard
              key={item.name}
              data={{
                name: item.name,
                count: item.count,
                percent: item.value,
              }}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricalData;
