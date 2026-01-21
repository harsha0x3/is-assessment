import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AppStatusOptions, DeptStatusOptions } from "@/utils/globalValues";
import { CheckIcon, ChevronsUpDownIcon, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useApplications from "../hooks/useApplications";
import Hint from "@/components/ui/hint";

export const AppStatusHeaderFilter = () => {
  const [searchParams] = useSearchParams();
  const { isLoading, appStatusStats } = useApplications();
  const { updateSearchParams } = useApplications();
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

  console.log("APPLICATION STATS", appStatusStats);

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
            variant="outline"
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
            <ChevronsUpDownIcon
              className="text-muted-foreground/80 shrink-0"
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
                          <Loader className="animate-spin" />
                        ) : appStatusStats ? (
                          appStatusStats[option.value]
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

export const DeptStatusHeaderFilter: React.FC<{ deptName: string }> = ({
  deptName,
}) => {
  const [searchParams] = useSearchParams();
  const { updateSearchParams } = useApplications();
  const deptStatus = searchParams.get("deptStatus");

  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const toggleSelection = (value: string) => {
    setSelectedValues((prev) => {
      const updated = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];

      if (updated.length > 0) {
        updateSearchParams({ deptStatus: updated.join(","), appPage: 1 });
      } else {
        updateSearchParams({ deptStatus: undefined, appPage: 1 });
      }

      return updated;
    });
  };

  useEffect(() => {
    if (deptStatus) {
      setSelectedValues(deptStatus.split(","));
    }
  }, [deptStatus]);
  const filterOptions = DeptStatusOptions;

  return (
    <div className="w-full max-w-xs space-y-2">
      {/* <Label htmlFor={"status-filter-trigger"}>Status Filter</Label> */}
      <Popover>
        <Hint label={`Status of ${deptName}`}>
          <PopoverTrigger asChild>
            <Button
              id={"status-filter-trigger"}
              variant="outline"
              role="combobox"
              className="h-auto min-h-8 w-full justify-between bg-transparent border-none shadow-none font-semibold"
            >
              {selectedValues.length > 0 ? (
                <span className="truncate">
                  <Badge variant="outline" className="rounded-sm">
                    {selectedValues.length}
                  </Badge>
                  Status
                </span>
              ) : (
                <span className="text-ring">Status</span>
              )}
              <ChevronsUpDownIcon
                className="text-muted-foreground/80 shrink-0"
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
        </Hint>
        <PopoverContent className="w-64 p-0">
          <Command>
            <CommandList>
              <CommandGroup className="space-y-3">
                <CommandItem
                  key={"all"}
                  value={undefined}
                  onSelect={() => {
                    setSelectedValues([]);
                    updateSearchParams({ deptStatus: undefined, appPage: 1 });
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
                    <span className="truncate">{option.label} </span>
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
