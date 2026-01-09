import { Outlet, Route, Routes } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import RootLayout from "./layouts/RootLayout";
import { Toaster } from "sonner";
import ProtectedLayout from "./layouts/ProtectedLayout";
import { lazy, Suspense } from "react";
import { Loader } from "lucide-react";
import { useGetMeQuery } from "./features/auth/store/authApiSlice";
import ApplicationsLayout from "./layouts/ApplicationsLayout";
import AppDrawer from "./features/applications/components/AppDrawer";

function App() {
  const { data: _data } = useGetMeQuery();
  const ApplicationsPage = lazy(
    () => import("./features/applications/pages/ApplicationsPage")
  );
  const AppDepartments = lazy(
    () => import("./features/departments/components/AppDepartments")
  );
  const AppOverview = lazy(
    () => import("./features/applications/components/AppOverview")
  );
  const DashboardPage = lazy(
    () => import("./features/dashboard/pages/DashboardPage")
  );

  return (
    <>
      <div>
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            closeButton: true,
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedLayout />}>
            <Route path="" element={<RootLayout />}>
              <Route
                path="dashboard"
                element={
                  <Suspense
                    fallback={
                      <div>
                        <Loader className="animate-spin" />
                      </div>
                    }
                  >
                    <DashboardPage />
                  </Suspense>
                }
              />
              <Route path="applications" element={<ApplicationsLayout />}>
                <Route path="" element={<AppDrawer />}>
                  <Route path="new" element={<AppOverview />} />
                  <Route path="details/:appId" element={<Outlet />}>
                    <Route
                      path="overview"
                      element={
                        <Suspense
                          fallback={
                            <div>
                              <Loader className="animate-spin" />
                            </div>
                          }
                        >
                          <AppOverview />
                        </Suspense>
                      }
                    />
                    <Route
                      path="departments"
                      element={
                        <Suspense
                          fallback={
                            <div>
                              <Loader className="animate-spin" />
                            </div>
                          }
                        >
                          <AppDepartments />
                        </Suspense>
                      }
                    />
                  </Route>
                </Route>
              </Route>
              <Route
                index
                path="users/all"
                element={
                  <Suspense fallback={<Loader className="animate-spin" />}>
                    <div>All users</div>
                  </Suspense>
                }
              />
            </Route>
          </Route>
        </Routes>
      </div>
    </>
  );
}

export default App;
