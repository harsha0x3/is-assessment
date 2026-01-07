// src\layouts\ApplicationsLayout.tsx

import ApplicationsPage from "@/features/applications/pages/ApplicationsPage";
import { Loader } from "lucide-react";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

const ApplicationsLayout: React.FC = () => {
  return (
    <>
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
    </>
  );
};

export default ApplicationsLayout;
