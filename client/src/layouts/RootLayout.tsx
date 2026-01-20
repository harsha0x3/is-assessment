import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React from "react";
import AppSidebar from "./components/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { Outlet, useLocation } from "react-router-dom";

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
        <AppSidebar />
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
