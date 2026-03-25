import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import DateRangeFilter from "@/features/_filters/DateRangeFilter";
import SeverityFilters from "@/features/_filters/SeverityFilters";
import PriorityFilters from "@/features/_filters/PriorityFilters";
import type { FilterProps } from "../../pages/AnalyticsDashboard";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS, SEVERITY_LABELS } from "@/utils/globalValues";
import { Filter, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Hint from "@/components/ui/hint";

interface Props {
  filters: FilterProps;
  setFilters: React.Dispatch<React.SetStateAction<FilterProps>>;
  syncFilters: boolean;
  setSyncFilters: (v: boolean) => void;
}

const PresentFilters: React.FC<Props> = ({
  filters,
  setFilters,
  syncFilters,
  setSyncFilters,
}) => {
  const selectedPriority = filters.priority || [];
  const visiblePriority = selectedPriority.slice(0, 2);
  const remainingPriorityCount = selectedPriority.length - 2;

  const selectedSeverity = filters.severity || [];
  const visibleSeverity = selectedSeverity.slice(0, 2);
  const remainingSeverityCount = selectedSeverity.length - 2;
  return (
    <div className="w-64 flex flex-col gap-5 border-l pl-4">
      <h3 className="font-semibold">Filters</h3>

      <div className="flex flex-col gap-1">
        <Label>Application Age</Label>

        <DateRangeFilter
          from={filters.app_age_from}
          to={filters.app_age_to}
          onChange={({ from, to }) =>
            setFilters((prev) => ({
              ...prev,
              app_age_from: from,
              app_age_to: to,
            }))
          }
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label>Priority</Label>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-transparent w-full flex items-center justify-between"
            >
              <span className="flex items-center gap-1 flex-wrap flex-1 min-w-0 overflow-hidden">
                {visiblePriority.length === 0 && (
                  <span className="text-muted-foreground truncate">
                    Select priority
                  </span>
                )}

                {visiblePriority.map((priority) => (
                  <Badge
                    key={priority}
                    variant="secondary"
                    className="flex items-center gap-1 shrink-0"
                  >
                    {PRIORITY_LABELS[priority]}
                  </Badge>
                ))}

                {remainingPriorityCount > 0 && (
                  <Badge variant="outline" className="shrink-0">
                    +{remainingPriorityCount}
                  </Badge>
                )}
              </span>

              <Filter
                className={`shrink-0 ${
                  filters.priority?.length > 0
                    ? "text-primary fill-primary"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          </DropdownMenuTrigger>

          <PriorityFilters
            selectedValues={filters.priority}
            onSubmit={(values) =>
              setFilters((prev) => ({
                ...prev,
                priority: values,
              }))
            }
          />
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-1">
        <Label>Severity</Label>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-transparent w-full flex items-center justify-between"
            >
              <span className="flex items-center gap-1 flex-wrap flex-1 min-w-0 overflow-hidden">
                {visibleSeverity.length === 0 && (
                  <span className="text-muted-foreground truncate">
                    Select severity
                  </span>
                )}

                {visibleSeverity.map((severity) => (
                  <Badge
                    key={severity}
                    variant="secondary"
                    className="flex items-center gap-1 shrink-0"
                  >
                    {SEVERITY_LABELS[severity]}
                  </Badge>
                ))}

                {remainingSeverityCount > 0 && (
                  <Badge variant="outline" className="shrink-0">
                    +{remainingSeverityCount}
                  </Badge>
                )}
              </span>

              <Filter
                className={`shrink-0 ${
                  filters.severity?.length > 0
                    ? "text-primary fill-primary"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          </DropdownMenuTrigger>

          <SeverityFilters
            selectedValues={filters.severity}
            onSubmit={(values) =>
              setFilters((prev) => ({
                ...prev,
                severity: values,
              }))
            }
          />
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <Label>
          <Hint label="Toggle this to sync filters across the dashboard.">
            <Info className="w-4 h-4 text-blue-700" />
          </Hint>{" "}
          Sync Filters
        </Label>
        <Switch checked={syncFilters} onCheckedChange={setSyncFilters} />
      </div>
    </div>
  );
};

export default PresentFilters;
