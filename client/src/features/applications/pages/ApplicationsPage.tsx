import { Input } from "@/components/ui/input";
import { Loader, PlusSquareIcon, Search, X } from "lucide-react";
import React from "react";
import AppFilters from "../components/AppFilters";
import AppPagination from "../components/AppPagination";
import useApplications from "../hooks/useApplications";
import AppsTable from "../components/AppsTable";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppStatusValues } from "@/utils/globalValues";
import { parseStatus } from "@/utils/helpers";
import { useGetOverallStatsQuery } from "@/features/dashboard/store/dashboardApiSlice";
import { Badge } from "@/components/ui/badge";

const ApplicationsPage: React.FC = () => {
  const { appSearchValue, updateSearchParams, appSearchBy } = useApplications();
  const [searchParams] = useSearchParams();
  const appStatus = searchParams.get("appStatus");
  const navigate = useNavigate();

  const { data: overAllStats, isLoading: isLoadingStats } =
    useGetOverallStatsQuery();

  return (
    <div className="h-full flex flex-col w-full space-y-2 overflow-hidden px-2">
      <div className="space-y-2">
        <div className="flex items-center justify-between h-12 px-1 rounded-md bg-accent text-accent-foreground">
          <h1>Applications</h1>
          {/* Search box */}
          <Button className="" onClick={() => navigate("/applications/new")}>
            New
            <PlusSquareIcon />
          </Button>
          <div className="relative max-w-100 min-w-70">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary h-4 w-4" />
            <Input
              type="text"
              name="email_or_username"
              value={appSearchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                updateSearchParams({ appSearch: e.target.value });
              }}
              placeholder={`Search app by ${appSearchBy}`}
              className="w-full pl-10 pr-3 py-2 border"
            />
          </div>
          <div className="flex gap-2">
            <AppFilters />
            <AppPagination />
          </div>
        </div>
        {/* Status Filters */}
        <div className="flex flex-col items-center justify-center w-full border rounded-md shadow-card sm:flex-row sm:gap-4 gap-2 py-1">
          <p className="pl-5 font-medium">Status Filters:</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-8 items-start gap-2">
            <Button
              className="px-0"
              variant={!appStatus ? "outline" : "ghost"}
              asChild
            >
              <div
                className="capitalize"
                onClick={() =>
                  updateSearchParams({ appStatus: undefined, appPage: 1 })
                }
              >
                All
                <Badge>
                  {isLoadingStats ? (
                    <Loader className="animate-spin" />
                  ) : overAllStats ? (
                    overAllStats.data.total_apps
                  ) : (
                    <X />
                  )}
                </Badge>
              </div>
            </Button>
            {AppStatusValues.map((status) => (
              <Button
                className="px-0"
                variant={appStatus === status ? "outline" : "ghost"}
                asChild
              >
                <div
                  className="capitalize px-0"
                  onClick={() =>
                    updateSearchParams({ appStatus: status, appPage: 1 })
                  }
                >
                  {parseStatus(status)}
                  <Badge>
                    {isLoadingStats ? (
                      <Loader className="animate-spin" />
                    ) : overAllStats ? (
                      overAllStats.data.app_statuses[status]
                    ) : (
                      <X />
                    )}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <AppsTable />
      </div>
    </div>
  );
};

export default ApplicationsPage;
