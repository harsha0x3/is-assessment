import React from "react";
import { useApplicationsContext } from "../../context/ApplicationsContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

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
              Applications older than
            </p>
            <span className="text-sm font-semibold">
              {Number(appSlaFilter) === 0 ? "Any age" : `${appSlaFilter} days`}
            </span>
          </div>

          <Input
            type="range"
            min={0}
            max={90}
            step={15}
            value={Number(appSlaFilter)}
            onChange={(e) =>
              updateSearchParams({ appSlaFilter: Number(e.target.value) })
            }
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>30</span>
            <span>60</span>
            <span>90+</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SLAFilterHeader;
