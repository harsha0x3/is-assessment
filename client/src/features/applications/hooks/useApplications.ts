import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { useListAllAppsQuery } from "@/features/applications/store/applicationsApiSlice";

export const useApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const appPage = parseInt(searchParams.get("appPage") || "1", 10);
  const appPageSize = parseInt(searchParams.get("appPageSize") || "15", 10);
  const appSortBy = searchParams.get("appSortBy") || "created_at";
  const appSortOrder = (searchParams.get("appSortOrder") || "desc") as
    | "asc"
    | "desc";
  const appSearchBy = (searchParams.get("appSearchBy") || "name") as
    | "name"
    | "environment"
    | "region"
    | "owner_name"
    | "vendor_company"
    | "vertical"
    | "ticket_id";
  const appSearchValue = searchParams.get("appSearch") || "";
  const appStatus = searchParams.get("appStatus");

  const appStatusList = appStatus
    ? appStatus.split(",").filter(Boolean)
    : undefined;

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [lastAppPage, setLastAppPage] = useState(appPage);

  const { data, isSuccess, isError, error, isLoading } = useListAllAppsQuery(
    {
      page: appPage,
      page_size: appPageSize,
      sort_by: appSortBy,
      sort_order: appSortOrder,
      search: debouncedSearch || "",
      search_by: appSearchBy,
      status: appStatusList,
    },
    { refetchOnMountOrArgChange: true }
  );

  const totalApps = useMemo(() => data?.data?.total_count, [data]);
  const filteredApps = useMemo(() => data?.data?.filtered_count, [data]);
  const appStatusStats = useMemo(() => data?.data?.app_stats, [data]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (appSearchValue && appSearchValue.trim() !== "") {
        if (appPage >= 1) setLastAppPage(appPage);
        updateSearchParams({
          appSearch: appSearchValue,
          appSearchBy: appSearchBy,
          appPage: -1,
        });
        setDebouncedSearch(appSearchValue);
      } else {
        updateSearchParams({ appSearch: null, appPage: lastAppPage });
        setDebouncedSearch("");
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [appSearchValue]);

  const updateSearchParams = (
    updates: Record<string, string | number | null | undefined>
  ) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null) newParams.delete(key);
      else newParams.set(key, String(value));
    });
    setSearchParams(newParams);
  };

  const goToPage = (page: number) => {
    updateSearchParams({ appPage: page });
  };

  return {
    appPage,
    appPageSize,
    appSortBy,
    appSortOrder,
    appSearchBy,
    isError,
    error,
    goToPage,
    updateSearchParams,
    data,
    totalApps,
    filteredApps,
    appStatusStats,
    isLoading,
    isSuccess,
    debouncedSearch,
    appSearchValue,
  };
};

export default useApplications;
