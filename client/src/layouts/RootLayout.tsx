import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React, { lazy, Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { Outlet, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
// import { Skeleton } from "@/components/ui/skeleton";

const AppSidebar = lazy(() => import("./components/AppSidebar"));

const SidebarSkeleton = () => (
  <div className="w-(--sidebar-width) h-full min-h-screen flex flex-col pt-12 px-3 border-r">
    <div className="flex flex-col gap-3">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-5 w-36" />
    </div>

    <Skeleton className="h-10 w-36 mt-auto" />
  </div>
);

const RootLayout: React.FC = () => {
  const location = useLocation();
  const headerTitle = location.pathname.includes("applications")
    ? "Applications"
    : location.pathname.includes("dashboard")
      ? "Dashboard"
      : location.pathname.includes("users")
        ? "User Management"
        : "InfoSec Assessment";
  return (
    <div className="w-full h-full overflow-hidden">
      <SidebarProvider>
        <Suspense fallback={<SidebarSkeleton />}>
          <AppSidebar />
        </Suspense>
        <SidebarInset className="min-w-0 flex flex-col h-screen">
          <header className="border-b flex h-(--app-header-height) shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="" />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
            {headerTitle}
          </header>

          <main className="flex-1 overflow-hidden min-w-0">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default RootLayout;
