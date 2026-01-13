import { Dialog, DialogContent } from "@/components/ui/dialog";
import React, { useEffect, useMemo, useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useGetApplicationDetailsQuery } from "../store/applicationsApiSlice";

const AppInfoDialog: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { appId } = useParams();
  const {
    data: appDetails,
    isLoading,
    error,
  } = useGetApplicationDetailsQuery(appId as string, {
    skip: !appId,
  });

  const appName = useMemo<string>(
    () => appDetails?.data.name ?? "",
    [appDetails]
  );

  const [isOpen, setIsOpen] = useState(
    location.pathname.startsWith("/applications/details")
  );

  const tabs = [
    { name: "Overview", value: "overview" },
    { name: "Departments", value: "departments" },
    { name: "Evidences", value: "evidences" },
  ];

  const currentTab = useMemo(() => {
    const path = location.pathname;
    return tabs.find((t) => path.includes(t.value))?.value ?? "overview";
  }, [location.pathname]);

  useEffect(() => {
    if (
      location.pathname.startsWith("/applications/details") &&
      !location.pathname.match(/overview|departments|evidences/)
    ) {
      navigate("overview", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    setIsOpen(location.pathname.startsWith("/applications/details"));
  }, [location.pathname]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        setIsOpen(false);
        navigate("/applications");
      }}
    >
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-none xs:w-135! sm:w-160! md:max-w-none md:w-260! lg:max-w-none lg:w-300! max-w-none h-[calc(100vh-3rem)] min-h-0"
      >
        {/* Root layout — unchanged flex behavior */}
        <div className="flex flex-col md:grid md:grid-cols-[16rem_1fr] min-h-0 h-full">
          {/* Mobile / Tablet top tabs */}
          <div className="md:hidden border-b">
            <Tabs value={currentTab} className="w-full">
              <TabsList className="w-full flex">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    onClick={() =>
                      navigate(`/applications/details/${appId}/${tab.value}`, {
                        state: { appName },
                      })
                    }
                    className="flex-1 rounded-none"
                  >
                    {tab.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden md:flex flex-col border-r bg-muted/30">
            <div className="p-4">
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">
                Application
              </h2>

              <nav className="flex flex-col gap-1">
                {tabs.map((tab) => (
                  <NavLink
                    key={tab.value}
                    to={`/applications/details/${appId}/${tab.value}`}
                    state={{ appName }}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-4 py-2 rounded-md text-sm transition-colors",
                        "hover:bg-muted",
                        isActive &&
                          "bg-background font-semibold text-primary border-l-4 border-primary"
                      )
                    }
                  >
                    {tab.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content area — outlet behavior preserved */}
          <main className="flex flex-col min-h-0 overflow-hidden md:mr-7 p-6 gap-6">
            <header className="border-b pb-2">
              <h1 className="text-lg font-semibold truncate">{appName}</h1>
            </header>

            <div className="flex-1 min-h-0 overflow-hidden">
              <Outlet />
            </div>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppInfoDialog;
