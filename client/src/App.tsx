import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import RootLayout from "./layouts/RootLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";
import ApplicationsLayout from "./layouts/ApplicationsLayout";
import AppInfoDialog from "./features/applications/components/AppInfoDialog";
import DepartmentInfo from "./features/departments/components/DepartmentInfo";
import { Toaster } from "sonner";
import { lazy } from "react";
import { LazyRoute } from "@/components/LazyRoute";
import { useGetMeQuery } from "./features/auth/store/authApiSlice";

const DashboardPage = lazy(
  () => import("./features/dashboard/pages/DashboardPage"),
);
const UserManagementPage = lazy(
  () => import("./features/user_management/pages/UserManagementPage"),
);
const AppOverview = lazy(
  () => import("./features/applications/components/AppOverview"),
);
const AppDepartments = lazy(
  () => import("./features/departments/components/AppDepartments"),
);
const EvidencesTab = lazy(
  () => import("./features/evidences/components/EvidencesTab"),
);

function App() {
  const { data: _data } = useGetMeQuery();
  return (
    <>
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{ closeButton: true }}
      />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<RootLayout />}>
            <Route
              path="dashboard"
              element={
                <LazyRoute fallbackLabel="Loading dashboard…">
                  <DashboardPage />
                </LazyRoute>
              }
            />

            <Route path="applications" element={<ApplicationsLayout />}>
              <Route element={<AppInfoDialog />}>
                <Route path="details/:appId" element={<Outlet />}>
                  <Route
                    path="overview"
                    element={
                      <LazyRoute fallbackLabel="Loading overview…">
                        <AppOverview />
                      </LazyRoute>
                    }
                  />

                  <Route
                    path="departments"
                    element={
                      <LazyRoute fallbackLabel="Loading departments…">
                        <AppDepartments />
                      </LazyRoute>
                    }
                  >
                    <Route path=":deptId" element={<DepartmentInfo />} />
                  </Route>

                  <Route
                    path="evidences"
                    element={
                      <LazyRoute fallbackLabel="Loading evidences…">
                        <EvidencesTab />
                      </LazyRoute>
                    }
                  />
                </Route>
              </Route>
            </Route>

            <Route
              path="users/all"
              element={
                <LazyRoute fallbackLabel="Loading users…">
                  <UserManagementPage />
                </LazyRoute>
              }
            />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
