import React, { Suspense } from "react";
import ExecDashboardTable from "../components/execDashboard/ExecDashboardTable";
import { useApplicationsContext } from "@/features/applications/context/ApplicationsContext";

import AppsToolbarSkeleton from "@/features/applications/components/skeletons/AppToolBarSkeleton";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { Loader, Search } from "lucide-react";
import AppPagination from "@/features/applications/components/AppPagination";
import StatusProgressBar from "@/features/applications/components/StatusProgressBar";

import AppFilters from "@/features/applications/components/AppFilters";
import { Input } from "@/components/ui/input";
import VerticalSearchFilter from "@/features/applications/components/tableHeaders/VerticalSearchFilter";

const ExecutiveDashboard: React.FC = () => {
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
    isLoading,
    error,
    isFetching,
  } = useApplicationsContext();
  const start = (appPage - 1) * appPageSize + 1;
  const end = Math.min(start + appPageSize - 1, filteredApps);

  const isFiltered = debouncedSearch || totalApps !== filteredApps;
  if (isLoading) {
    return (
      <div className="h-full flex flex-col w-full space-y-2 overflow-hidden px-2">
        <AppsToolbarSkeleton />
        <div className="flex-1 overflow-auto">
          <TableSkeleton columns={7} rows={10} />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 text-sm text-destructive">
        {getApiErrorMessage(error)}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full space-y-2 overflow-hidden px-2">
      <div className="space-y-2">
        {/* Tool Bar */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between h-12 px-1 rounded-md bg-accent text-accent-foreground mt-2">
          {/* Search box */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-65 min-w-70">
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

          <div className="w-xs h-full">
            <VerticalSearchFilter orientation="horizontal" />
          </div>

          <div className="hidden md:flex items-center gap-3">
            <p className="text-sm text-muted-foreground md:whitespace-nowrap">
              Showing{" "}
              <span className="font-medium text-foreground">
                {start}–{end}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {filteredApps}
              </span>{" "}
              applications
              {isFiltered && (
                <>
                  {" "}
                  (filtered from{" "}
                  <span className="font-medium text-foreground">
                    {totalApps}
                  </span>
                  )
                </>
              )}
            </p>
          </div>
        </div>
      </div>
      {data?.data?.filtered_apps_summary && (
        <StatusProgressBar
          summary={data?.data.filtered_apps_summary.app_statuses}
        />
      )}
      {isFetching && (
        <div className="flex items-center justify-center gap-2 z-10 px-2 py-1 text-xs text-muted-foreground">
          <div className="border p-2 flex items-center  gap-2">
            <Loader className="h-3 w-3 animate-spin" />
            Updating…
          </div>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <Suspense fallback={<TableSkeleton columns={7} rows={14} />}>
          <ExecDashboardTable />
        </Suspense>
      </div>
      <div className="flex items-center gap-3 px-2 pb-2">
        <AppPagination />
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
