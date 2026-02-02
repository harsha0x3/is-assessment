import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApplicationsContext } from "../../context/ApplicationsContext";
import { AppStatusOptions } from "@/utils/globalValues";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, Filter, Loader } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const AppStatusHeaderFilter: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    isLoading,
    appStatusSummary,
    updateSearchParams,
    filteredAppsSummary,
  } = useApplicationsContext();
  const appStatus = searchParams.get("appStatus");

  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const toggleSelection = (value: string) => {
    setSelectedValues((prev) => {
      const updated = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];

      if (updated.length > 0) {
        updateSearchParams({ appStatus: updated.join(","), appPage: 1 });
      } else {
        updateSearchParams({ appStatus: undefined, appPage: 1 });
      }

      return updated;
    });
  };

  useEffect(() => {
    if (appStatus) {
      setSelectedValues(appStatus.split(","));
    }
  }, [appStatus]);
  const filterOptions = AppStatusOptions;

  return (
    <div className="w-full max-w-xs space-y-2">
      {/* <Label htmlFor={"status-filter-trigger"}>Status Filter</Label> */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={"status-filter-trigger"}
            variant="ghost"
            role="combobox"
            className="h-auto min-h-8 w-full justify-between bg-transparent border-none shadow-none font-semibold"
          >
            {selectedValues.length > 0 ? (
              <span>
                <Badge variant="outline" className="rounded-sm">
                  {selectedValues.length}
                </Badge>{" "}
                Filtered Status
              </span>
            ) : (
              <span className="text-ring">Status</span>
            )}
            <Filter
              className={`shrink-0 ${!!appStatus ? "text-primary fill-primary" : "text-muted-foreground"}`}
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <Command>
            <CommandList>
              <CommandGroup className="space-y-3">
                <CommandItem
                  key={"all"}
                  value={undefined}
                  onSelect={() => {
                    setSelectedValues([]);
                    updateSearchParams({ appStatus: undefined, appPage: 1 });
                  }}
                >
                  <span className="truncate">Select all</span>
                  {selectedValues.length === 0 && (
                    <CheckIcon size={16} className="ml-auto" />
                  )}
                </CommandItem>
                {filterOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => toggleSelection(option.value)}
                  >
                    <span className="truncate">
                      {option.label}{" "}
                      <Badge variant={"outline"} className="rounded-full">
                        {isLoading ? (
                          <Loader className="animate-spin w-3 h-3" />
                        ) : appStatusSummary ? (
                          <span>
                            {filteredAppsSummary && (
                              <span>{filteredAppsSummary[option.value]}</span>
                            )}
                            {" / "}
                            {appStatusSummary[option.value]}
                          </span>
                        ) : (
                          "-"
                        )}
                      </Badge>
                    </span>
                    {selectedValues.includes(option.value) && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AppStatusHeaderFilter;
