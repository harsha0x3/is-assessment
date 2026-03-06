import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApplicationsContext } from "../../context/ApplicationsContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, Filter } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const AppSeverityHeaderFilter = () => {
  const [searchParams] = useSearchParams();
  const { updateSearchParams } = useApplicationsContext();
  const appSeverity = searchParams.get("appSeverity");

  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const toggleSelection = (value: string) => {
    setSelectedValues((prev) => {
      const updated = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];

      if (updated.length > 0) {
        updateSearchParams({ appSeverity: updated.join(","), appPage: 1 });
      } else {
        updateSearchParams({ appSeverity: undefined, appPage: 1 });
      }

      return updated;
    });
  };

  useEffect(() => {
    if (appSeverity) {
      setSelectedValues(appSeverity.split(","));
    }
  }, [appSeverity]);

  return (
    <div className="w-full max-w-xs space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={"severity-filter-trigger"}
            variant="ghost"
            role="combobox"
            className="h-auto min-h-8 w-full justify-between bg-transparent border-none shadow-none font-semibold"
          >
            {selectedValues.length > 0 ? (
              <span>
                <Badge variant="outline" className="rounded-sm">
                  {selectedValues.length}
                </Badge>{" "}
                Severity
              </span>
            ) : (
              <span className="text-ring">Severity</span>
            )}
            <Filter
              className={`shrink-0 ${!!appSeverity ? "text-primary fill-primary" : "text-muted-foreground"}`}
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
                    updateSearchParams({ appSeverity: undefined, appPage: 1 });
                  }}
                >
                  <span className="truncate">Select all</span>
                  {selectedValues.length === 0 && (
                    <CheckIcon size={16} className="ml-auto" />
                  )}
                </CommandItem>
                <CommandItem value={"4"} onSelect={() => toggleSelection("4")}>
                  Crown Jewel
                  {selectedValues.includes("4") && (
                    <CheckIcon size={16} className="ml-auto" />
                  )}
                </CommandItem>
                <CommandItem value={"3"} onSelect={() => toggleSelection("3")}>
                  High
                  {selectedValues.includes("3") && (
                    <CheckIcon size={16} className="ml-auto" />
                  )}
                </CommandItem>
                <CommandItem value={"2"} onSelect={() => toggleSelection("2")}>
                  Medium
                  {selectedValues.includes("2") && (
                    <CheckIcon size={16} className="ml-auto" />
                  )}
                </CommandItem>
                <CommandItem value={"1"} onSelect={() => toggleSelection("1")}>
                  Low
                  {selectedValues.includes("1") && (
                    <CheckIcon size={16} className="ml-auto" />
                  )}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AppSeverityHeaderFilter;
