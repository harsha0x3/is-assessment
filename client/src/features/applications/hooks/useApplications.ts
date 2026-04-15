import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { useListAllAppsQuery } from "@/features/applications/store/applicationsApiSlice";

export const useApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawAppPage = parseInt(searchParams.get("appPage") || "1", 10);
  const appPageSize = parseInt(searchParams.get("appPageSize") || "15", 10);
  const appSortBy = searchParams.get("appSortBy") || "started_at";
  const appSortOrder = (searchParams.get("appSortOrder") || "desc") as
    | "asc"
    | "desc";
  const appSearchBy = searchParams.get("appSearchBy") as
    | "name"
    | "environment"
    | "region"
    | "owner_name"
    | "vendor_company"
    | "vertical"
    | "ticket_id"
    | undefined;
  const appSearchValue = searchParams.get("appSearch") || "";
  const appStatus = searchParams.get("appStatus");
  const deptStatus = searchParams.get("deptStatus");
  const deptFilterId = searchParams.get("deptFilterId");
  const appPage = rawAppPage === -1 ? 1 : rawAppPage;
  const appPriority = searchParams.get("appPriority");

  const appVertical = searchParams.get("appVertical");
  const appSeverity = searchParams.get("appSeverity");
  const appType = searchParams.get("appType");
  const appFeatures = searchParams.get("appFeatures");
  const appScope = searchParams.get("appScope");

  const appAgeFromFilter = searchParams.get("appAgeFrom");
  const appAgeToFilter = searchParams.get("appAgeTo");
  const appEnvironment = searchParams.get("appEnvironment");
  const appsMode = searchParams.get("appsMode");

  const appStatusList = useMemo(
    () => (appStatus ? appStatus.split(",").filter(Boolean) : undefined),
    [appStatus],
  );
  const appPriorityList = useMemo(
    () => (appPriority ? appPriority.split(",").filter(Boolean) : undefined),
    [appPriority],
  );
  const appVerticalIds = searchParams.get("appVerticalIds");

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [lastAppPage, setLastAppPage] = useState(rawAppPage);

  const { data, isSuccess, isError, error, isLoading, isFetching } =
    useListAllAppsQuery({
      page: rawAppPage,
      page_size: appPageSize,
      sort_by: appSortBy,
      sort_order: appSortOrder,
      search: debouncedSearch || "",
      search_by: appSearchBy ?? undefined,
      status: appStatusList,
      dept_filter_id: deptFilterId ?? undefined,
      dept_status: deptStatus ?? undefined,
      app_priority: appPriorityList,
      vertical: appVertical ?? undefined,
      severity: appSeverity ?? undefined,
      app_features: appFeatures ?? undefined,
      app_type: appType ?? undefined,
      vertical_ids: appVerticalIds ?? undefined,

      app_age_from:
        appAgeFromFilter && appAgeFromFilter.trim() !== ""
          ? appAgeFromFilter
          : undefined,
      app_age_to:
        appAgeToFilter && appAgeToFilter.trim() !== ""
          ? appAgeToFilter
          : undefined,
      scope: appScope ?? undefined,
      environment: appEnvironment ?? undefined,
      mode: appsMode ?? undefined,
    });

  const totalApps = useMemo(
    () => data?.data?.apps_summary?.total_apps ?? 0,
    [data],
  );
  const filteredApps = useMemo(
    () => data?.data?.filtered_apps_summary?.total_apps ?? 0,
    [data],
  );
  const appStatusSummary = useMemo(() => data?.data?.apps_summary, [data]);
  const filteredAppsSummary = useMemo(
    () => data?.data?.filtered_apps_summary,
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
    appStatus,
    appType,
    appFeatures,
    appAgeFromFilter,
    appAgeToFilter,
    appScope,
    appVerticalIds,
    appEnvironment,
  };
};

export default useApplications;
