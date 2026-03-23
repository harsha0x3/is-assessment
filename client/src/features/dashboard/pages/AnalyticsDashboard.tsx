import React, { lazy, Suspense, useState } from "react";
import { CardLoader, SectionLoader } from "../components/Loaders";
const VAPTStatusStackedChart = lazy(
  () => import("../components/vapt/VAPTStatusStackedChart"),
);
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PresentData = lazy(() => import("../components/analytics/PresentData"));
const HistoricalData = lazy(
  () => import("../components/analytics/HistoricalData"),
);
const DepartmentSummary = lazy(
  () => import("../components/analytics/DepartmentSummary"),
);
const AppTypeDonutCard = lazy(
  () => import("../components/analytics/AppTypeDonutCard"),
);
export interface FilterProps {
  severity: string[];
  priority: string[];
  app_age_from?: string;
  app_age_to?: string;
}

export interface DeptFilterProps extends FilterProps {
  app_status?: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [filters, setFilters] = useState<FilterProps>({
    severity: [],
    priority: [],
  });

  const [deptFilters, setDeptFilters] = useState<DeptFilterProps>({
    severity: [],
    priority: [],
    app_status: "all",
  });

  const [syncFilters, setSyncFilters] = useState(false);

  return (
    <div className="space-y-6 p-2 h-full overflow-auto">
      <div className="flex w-full items-center gap-3">
        <div className="min-w-0 flex-1">
          <Suspense fallback={<CardLoader />}>
            <PresentData
              filters={filters}
              setFilters={setFilters}
              syncFilters={syncFilters}
              setSyncFilters={setSyncFilters}
            />
          </Suspense>
        </div>

        <div>
          <Suspense fallback={<CardLoader />}>
            <HistoricalData />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<SectionLoader />}>
        <DepartmentSummary
          filters={filters}
          deptFilters={deptFilters}
          setDeptFilters={setDeptFilters}
          syncFilters={syncFilters}
        />
      </Suspense>
      <div>
        <Suspense fallback={<CardLoader />}>
          <AppTypeDonutCard
            filters={{ ...filters, app_status: "all" }}
            syncFilters={syncFilters}
          />
        </Suspense>
      </div>
      <div>
        <Suspense fallback={<CardLoader />}>
          <Card>
            <CardHeader>
              <CardTitle>VAPT Applications Summary per Status</CardTitle>
            </CardHeader>
            <CardContent className="h-150">
              <VAPTStatusStackedChart />
            </CardContent>
          </Card>
        </Suspense>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
