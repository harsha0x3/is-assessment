// src\layouts\ApplicationsLayout.tsx

import { ApplicationsProvider } from "@/features/applications/context/ApplicationsContext";

import { Loader } from "lucide-react";
import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";

const ApplicationsPage = lazy(
  () => import("@/features/applications/pages/ApplicationsPage"),
);

const ApplicationsLayout: React.FC = () => {
  return (
    <>
      <ApplicationsProvider>
        <Suspense
          fallback={
            <div>
              <Loader className="animate-spin" />
              Loading...
            </div>
          }
        >
          <ApplicationsPage />
        </Suspense>
        <Outlet />
      </ApplicationsProvider>
    </>
  );
};

export default ApplicationsLayout;
