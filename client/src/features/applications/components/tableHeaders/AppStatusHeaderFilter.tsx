import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApplicationsContext } from "../../context/ApplicationsContext";
import { AppStatusOptions } from "@/utils/globalValues";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Loader } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const AppStatusHeaderFilter: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    isLoading,
    appStatusSummary,
    updateSearchParams,
    filteredAppsSummary,
  } = useApplicationsContext();

  const appStatus = searchParams.get("appStatus");

  const [toggledValues, setToggledValues] = useState<string[]>([]);

  useEffect(() => {
    if (appStatus) {
      setToggledValues(appStatus.split(","));
    } else {
      setToggledValues([]);
    }
  }, [appStatus]);

  const toggleSelection = (value: string) => {
    setToggledValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const applyFilters = () => {
    if (toggledValues.length > 0) {
      updateSearchParams({
        appStatus: toggledValues.join(","),
        appPage: 1,
      });
    } else {
      updateSearchParams({
        appStatus: undefined,
        appPage: 1,
      });
    }
  };

  const clearFilters = () => {
    setToggledValues([]);
    updateSearchParams({
      appStatus: undefined,
      appPage: 1,
    });
  };

  return (
    <div className="w-full max-w-xs space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto min-h-8 w-full justify-between bg-transparent font-semibold"
          >
            {toggledValues.length > 0 ? (
              <span>
                <Badge variant="outline" className="rounded-sm">
                  {toggledValues.length}
                </Badge>{" "}
                Filtered Status
              </span>
            ) : (
              <span className="text-ring">Status</span>
            )}

            <Filter
              className={`shrink-0 ${
                appStatus
                  ? "text-primary fill-primary"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64">
          <DropdownMenuGroup>
            {AppStatusOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={toggledValues.includes(option.value)}
                onSelect={(e) => {
                  e.preventDefault(); // keep dropdown open
                  toggleSelection(option.value);
                }}
              >
                <span className="flex items-center justify-between w-full">
                  {option.label}

                  <Badge variant="outline" className="rounded-full ml-2">
                    {isLoading ? (
                      <Loader className="animate-spin w-3 h-3" />
                    ) : appStatusSummary ? (
                      <span>
                        {filteredAppsSummary?.[option.value] ?? 0} /{" "}
                        {appStatusSummary[option.value]}
                      </span>
                    ) : (
                      "-"
                    )}
                  </Badge>
                </span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup className="flex justify-between">
            <Button size="sm" variant="secondary" onClick={applyFilters}>
              Apply
            </Button>

            <Button size="sm" variant="destructive" onClick={clearFilters}>
              Clear
            </Button>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AppStatusHeaderFilter;
