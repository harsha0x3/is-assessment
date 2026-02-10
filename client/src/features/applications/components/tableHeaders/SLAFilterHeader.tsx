import React from "react";
import { useApplicationsContext } from "../../context/ApplicationsContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SLAFilterHeader: React.FC = () => {
  const { appSlaFilter, updateSearchParams } = useApplicationsContext();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={"vertical-filter-trigger"}
          variant="ghost"
          role="combobox"
          className="h-auto min-h-8 w-full justify-between bg-transparent border-none shadow-none font-semibold"
        >
          <span className="text-ring">Duration</span>
          <Filter
            className={`shrink-0 ${!!appSlaFilter && Number(appSlaFilter) > 0 ? "text-primary fill-primary" : "text-muted-foreground"}`}
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 " side="top">
        <div className="flex flex-col gap-2 min-w-64">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Applications SLA
            </p>
            <span className="text-sm font-semibold">
              {Number(appSlaFilter) === 0 ? "Any age" : `${appSlaFilter} days`}
            </span>
          </div>

          <Select
            value={appSlaFilter ?? "all"}
            onValueChange={(val) => {
              if (val) updateSearchParams({ appSlaFilter: Number(val) });
              else updateSearchParams({ appSlaFilter: undefined });
            }}
          >
            <SelectTrigger className="w-full max-w-48 ">
              <SelectValue placeholder="Select duration" className="w-48" />
            </SelectTrigger>
            <SelectContent className="w-48">
              <SelectItem value="0">Any age</SelectItem>
              <SelectItem value="30">0 - 30 days</SelectItem>
              <SelectItem value="60">30 - 60 days</SelectItem>
              <SelectItem value="90">60 - 90 days</SelectItem>
              <SelectItem value="91">90+ days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SLAFilterHeader;
