import { Input } from "@/components/ui/input";
import { Loader, PlusSquareIcon, Search } from "lucide-react";
import React, { lazy, Suspense, useState } from "react";
import AppFilters from "../components/AppFilters";
import AppPagination from "../components/AppPagination";
import { Button } from "@/components/ui/button";
import StatusProgressBar from "../components/StatusProgressBar";
import { useSearchParams } from "react-router-dom";
import { parseDept } from "@/utils/helpers";

const AppsTable = lazy(() => import("../components/AppsTable"));
const NewAppDialog = lazy(
  () => import("@/features/applications/components/NewAppDialog"),
);
import { InlineLoader } from "@/components/loaders/InlineLoader";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { useApplicationsContext } from "../context/ApplicationsContext";
import { useSelector } from "react-redux";
import { selectAuth } from "@/features/auth/store/authSlice";
import AppsToolbarSkeleton from "../components/skeletons/AppToolBarSkeleton";
import TableSkeleton from "@/components/skeletons/TableSkeleton";

const ApplicationsPage: React.FC = () => {
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
  const [openNewApp, setIsopenNewApp] = useState<boolean>(false);
  const currentUserInfo = useSelector(selectAuth);
  const start = (appPage - 1) * appPageSize + 1;
  const end = Math.min(start + appPageSize - 1, filteredApps);
  const [searchParams] = useSearchParams();

  const departmentView = searchParams.get("view");

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
      {["admin", "manager"].includes(currentUserInfo.role) && openNewApp && (
        <Suspense fallback={<InlineLoader />}>
          <NewAppDialog
            isOpen={openNewApp}
            onOpenChange={() => setIsopenNewApp(false)}
          />
        </Suspense>
      )}
      <div className="space-y-2">
        {/* Tool Bar */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between h-12 px-1 rounded-md bg-accent text-accent-foreground mt-2">
          {/* Search box */}
          <div className="flex items-center gap-2">
            <Button className="" onClick={() => setIsopenNewApp(true)}>
              New
              <PlusSquareIcon />
            </Button>
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
          {departmentView && (
            <p>
              <span className="text-muted-foreground">Department:</span>{" "}
              {parseDept(departmentView)}
            </p>
          )}
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

      <StatusProgressBar summary={data?.data.apps_summary} />
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
          <AppsTable />
        </Suspense>
      </div>
      <div className="flex items-center gap-3 px-2 pb-2">
        <div className="text-sm md:hidden block text-muted-foreground md:whitespace-nowrap">
          Showing{" "}
          <span className="font-medium text-foreground">
            {start}–{end}
          </span>{" "}
          of <span className="font-medium text-foreground">{filteredApps}</span>{" "}
          applications
          {isFiltered && (
            <>
              {" "}
              (filtered from{" "}
              <span className="font-medium text-foreground">{totalApps}</span>)
            </>
          )}
        </div>

        <AppPagination />
      </div>
    </div>
  );
};

export default ApplicationsPage;
