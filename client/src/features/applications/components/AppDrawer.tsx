import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

const AppDrawer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { appId } = useParams();
  const [isDrawerOpen, setIsdrawerOpen] = useState<boolean>(
    () =>
      location?.pathname.startsWith("/applications/details") ||
      location?.pathname.startsWith("/applications/new")
  );

  useEffect(() => {
    if (location?.pathname.startsWith("/applications/details")) {
      setIsdrawerOpen(true);
    } else if (location?.pathname.startsWith("/applications/new")) {
      setIsdrawerOpen(true);
    } else {
      setIsdrawerOpen(false);
    }
  }, [location]);

  const tabs: { name: string; value: string }[] = [
    { name: "Overview", value: "overview" },
    { name: "Departments", value: "departments" },
    { name: "Comments", value: "comments" },
    { name: "Evidences", value: "evidences" },
  ];
  const currentTab = useMemo(() => {
    const splitPath = location.pathname.split("/");

    if (splitPath.includes("overview")) return "overview";
    if (splitPath.includes("departments")) return "departments";
    if (splitPath.includes("comments")) return "comments";
    if (splitPath.includes("evidences")) return "evidences";

    return "overview"; // fallback
  }, [location.pathname]);

  useEffect(() => {
    if (
      location.pathname.startsWith("/applications/details") &&
      !location.pathname.match(/overview|departments|comments|evidences/)
    ) {
      navigate("overview", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div>
      <Sheet
        open={isDrawerOpen}
        onOpenChange={() => {
          setIsdrawerOpen((prev) => !prev);
          navigate("/applications");
        }}
      >
        <SheetContent className="flex flex-col w-1/3 top-2 bottom-2 right-2 sm:max-w-1/3 md:max-w-1/3 lg:max-w-1/3 rounded-md">
          <div>
            <Tabs defaultValue={currentTab} className="gap-2">
              <TabsList className="bg-background justify-start rounded-none border-b p-0">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    onClick={() => {
                      navigate(`/applications/details/${appId}/${tab.value}`);
                    }}
                    className="bg-background border-b-primary dark:data-[state=active]:bg-background data-[state=active]:border-primary data-[state=active]:border-b-background h-full rounded-none rounded-t border border-transparent data-[state=active]:-mb-0.5 data-[state=active]:shadow-none dark:border-b-0 dark:data-[state=active]:-mb-0.5"
                  >
                    {tab.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <Outlet />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AppDrawer;
