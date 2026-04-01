import { ApplicationsProvider } from "@/features/applications/context/ApplicationsContext";
import React, { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
const ExecutiveDashboard = lazy(() => import("../pages/ExecutiveDashboard"));

const ExecDashboardLayout: React.FC = () => {
  return (
    <>
      <ApplicationsProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <ExecutiveDashboard />
        </Suspense>
        <Outlet />
      </ApplicationsProvider>
    </>
  );
};

export default ExecDashboardLayout;
