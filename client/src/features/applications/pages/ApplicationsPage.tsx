import { Input } from "@/components/ui/input";
import { Loader, PlusSquareIcon, Search } from "lucide-react";
import React, { lazy, Suspense, useState } from "react";
import AppFilters from "../components/AppFilters";
import AppPagination from "../components/AppPagination";
import useApplications from "../hooks/useApplications";
import AppsTable from "../components/AppsTable";
import { Button } from "@/components/ui/button";
import StatusProgressBar from "../components/StatusProgressBar";

const ApplicationsPage: React.FC = () => {
  const NewAppDialog = lazy(
    () => import("@/features/applications/components/NewAppDialog")
  );

  const {
    appSearchValue,
    updateSearchParams,
    appSearchBy,
    data,
    filteredApps,
    totalApps,
    appPage,
    appPageSize,
    debouncedSearch,
  } = useApplications();
  const [openNewApp, setIsopenNewApp] = useState<boolean>(false);
  if (!filteredApps || filteredApps === 0) {
    return (
      <p className="text-sm text-muted-foreground">No applications found</p>
    );
  }

  if (!filteredApps || filteredApps === 0) {
    return (
      <p className="text-sm text-muted-foreground">No applications found</p>
    );
  }

  const start = (appPage - 1) * appPageSize + 1;
  const end = Math.min(start + appPageSize - 1, filteredApps);

  const isFiltered = debouncedSearch || totalApps !== filteredApps;

  return (
    <div className="h-full flex flex-col w-full space-y-2 overflow-hidden px-2">
      {openNewApp && (
        <Suspense
          fallback={
            <div>
              <Loader className="animate-spin" />
            </div>
          }
        >
          <NewAppDialog
            isOpen={openNewApp}
            onOpenChange={() => setIsopenNewApp(false)}
          />
        </Suspense>
      )}
      <div className="space-y-2">
        <div className="flex items-center justify-between h-12 px-1 rounded-md bg-accent text-accent-foreground mt-2">
          {/* Search box */}
          <div className="flex items-center gap-2">
            <Button className="" onClick={() => setIsopenNewApp(true)}>
              New
              <PlusSquareIcon />
            </Button>
            <div className="relative max-w-100 min-w-70">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary h-4 w-4" />
              <Input
                type="text"
                value={appSearchValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  updateSearchParams({ appSearch: e.target.value });
                }}
                placeholder={`Search app by ${appSearchBy}`}
                className="w-full pl-10 pr-3 py-2 border"
              />
            </div>

            <AppFilters />
          </div>
          <div className="flex items-center">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {start}–{end}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {filteredApps}
              </span>{" "}
              {isFiltered && (
                <>
                  (Filtered from{" "}
                  <span className="font-medium text-foreground">
                    {totalApps}
                  </span>{" "}
                  Total)
                </>
              )}
            </p>
            <AppPagination />
          </div>
        </div>
      </div>
      <StatusProgressBar stats={data?.data.app_stats} />
      <div className="flex-1 overflow-auto">
        <AppsTable />
      </div>
    </div>
  );
};

export default ApplicationsPage;
