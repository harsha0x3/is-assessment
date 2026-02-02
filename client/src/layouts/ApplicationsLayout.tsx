// src\layouts\ApplicationsLayout.tsx

import { ApplicationsProvider } from "@/features/applications/context/ApplicationsContext";
import ApplicationsPage from "@/features/applications/pages/ApplicationsPage";
import { Loader } from "lucide-react";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

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
