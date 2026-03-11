import React from "react";
import { useApplicationsContext } from "../../context/ApplicationsContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import DateFilterTabs from "@/features/_filters/DateFilterTabs";

const SLAFilterHeader: React.FC = () => {
  const { appAgeFromFilter, appAgeToFilter, updateSearchParams } =
    useApplicationsContext();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto min-h-8 w-full justify-between bg-transparent border-none shadow-none font-semibold"
        >
          <span className="text-ring">Duration</span>

          <Filter
            className={`shrink-0 ${
              appAgeFromFilter || appAgeToFilter
                ? "text-primary fill-primary"
                : "text-muted-foreground"
            }`}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent side="top" className="w-[320px]">
        <DateFilterTabs
          initialFrom={appAgeFromFilter ?? undefined}
          initialTo={appAgeToFilter ?? undefined}
          onApply={({ from, to }) => {
            updateSearchParams({
              appAgeFrom: from,
              appAgeTo: to,
            });
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default SLAFilterHeader;
