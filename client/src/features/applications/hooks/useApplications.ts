import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { useListAllAppsQuery } from "@/features/applications/store/applicationsApiSlice";

export const useApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawAppPage = parseInt(searchParams.get("appPage") || "1", 10);
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
  const deptStatus = searchParams.get("deptStatus");
  const deptFilterId = searchParams.get("deptFilterId");
  const appPage = rawAppPage === -1 ? 1 : rawAppPage;
  const appPriority = searchParams.get("appPriority");
  const appVertical = searchParams.get("appVertical");

  const appStatusList = useMemo(
    () => (appStatus ? appStatus.split(",").filter(Boolean) : undefined),
    [appStatus],
  );
  const appPriorityList = useMemo(
    () => (appPriority ? appPriority.split(",").filter(Boolean) : undefined),
    [appPriority],
  );

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedVerticalSearch, setDebouncedVerticalSearch] = useState("");
  const [lastAppPage, setLastAppPage] = useState(rawAppPage);

  const { data, isSuccess, isError, error, isLoading, isFetching } =
    useListAllAppsQuery({
      page: rawAppPage,
      page_size: appPageSize,
      sort_by: appSortBy,
      sort_order: appSortOrder,
      search: debouncedSearch || "",
      search_by: appSearchBy,
      status: appStatusList,
      dept_filter_id: deptFilterId ?? undefined,
      dept_status: deptStatus ?? undefined,
      app_priotity: appPriorityList,
      vertical: debouncedVerticalSearch ?? undefined,
    });

  const totalApps = useMemo(() => data?.data?.total_count ?? 0, [data]);
  const filteredApps = useMemo(() => data?.data?.filtered_count ?? 0, [data]);
  const appStatusSummary = useMemo(() => data?.data?.apps_summary, [data]);
  const filteredAppsSummary = useMemo(
    () => data?.data?.filtered_summary,
    [data],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (appSearchValue && appSearchValue.trim() !== "") {
        if (rawAppPage >= 1) setLastAppPage(rawAppPage);
        updateSearchParams({
          appSearch: appSearchValue,
          appSearchBy: appSearchBy,
          appPage: 1,
        });
        setDebouncedSearch(appSearchValue);
      } else {
        updateSearchParams({ appSearch: null, appPage: lastAppPage });
        setDebouncedSearch("");
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [appSearchValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (appVertical && appVertical.trim() !== "") {
        if (rawAppPage >= 1) setLastAppPage(rawAppPage);
        updateSearchParams({
          appVertical: appVertical,
          appPage: 1,
        });
        setDebouncedVerticalSearch(appVertical);
      } else {
        updateSearchParams({ appSearch: null, appPage: lastAppPage });
        setDebouncedVerticalSearch("");
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [appVertical]);

  const updateSearchParams = (
    updates: Record<string, string | number | null | undefined>,
  ) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null) newParams.delete(key);
      else newParams.set(key, String(value));
    });
    setSearchParams(newParams, { replace: true });
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
    appStatusSummary,
    isLoading,
    isSuccess,
    debouncedSearch,
    appSearchValue,
    isFetching,
    appVertical,
    filteredAppsSummary,
  };
};

export default useApplications;
