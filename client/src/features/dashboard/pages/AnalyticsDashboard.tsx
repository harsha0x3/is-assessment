import React, { lazy, Suspense } from "react";
import { CardLoader } from "../components/Loaders";

const HistoricalData = lazy(
  () => import("../components/analytics/HistoricalData"),
);

const PresentData = lazy(() => import("../components/analytics/PresentData"));
const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Suspense fallback={<CardLoader />}>
          <PresentData />
        </Suspense>
      </div>
      <Suspense fallback={<CardLoader />}>
        <HistoricalData />
      </Suspense>
    </div>
  );
};

export default AnalyticsDashboard;
