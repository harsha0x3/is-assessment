import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetApplicationSummaryQuery } from "../../store/dashboardApiSlice";
import StatusBarChart from "./StatusBarChart";
import PresentFilters from "./PresentFilters";
import { getApiErrorMessage } from "@/utils/handleApiError";
import type { FilterProps } from "../../pages/AnalyticsDashboard";
interface Props {
  filters: FilterProps;
  setFilters: React.Dispatch<React.SetStateAction<FilterProps>>;
  syncFilters: boolean;
  setSyncFilters: (v: boolean) => void;
}

const PresentData: React.FC<Props> = ({
  filters,
  setFilters,
  syncFilters,
  setSyncFilters,
}) => {
  const { data, isLoading, error } = useGetApplicationSummaryQuery({
    severity: filters.severity?.join(","),
    priority: filters.priority?.join(","),
    app_age_from: filters.app_age_from,
    app_age_to: filters.app_age_to,
  });

  return (
    <Card className="h-150 flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex justify-between">
          Present Data
          {data?.filtered_apps && (
            <span className="text-muted-foreground">
              Applications Count: {data.filtered_apps}
            </span>
          )}
          <div />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex gap-5 flex-1 min-h-0">
        {error ? (
          <div>{getApiErrorMessage(error)}</div>
        ) : (
          <>
            <StatusBarChart
              data={data}
              isLoading={isLoading}
              filters={filters}
            />

            <PresentFilters
              filters={filters}
              setFilters={setFilters}
              syncFilters={syncFilters}
              setSyncFilters={setSyncFilters}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PresentData;
