import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useApplicationsContext } from "../../context/ApplicationsContext";

import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import SeverityFilters from "@/features/_filters/SeverityFilters";

const AppSeverityHeaderFilter = () => {
  const [searchParams] = useSearchParams();
  const { updateSearchParams } = useApplicationsContext();
  const appSeverity = searchParams.get("appSeverity");

  const onSubmit = (data: string[]) => {
    if (data.length > 0) {
      updateSearchParams({ appSeverity: data.join(","), appPage: 1 });
    } else {
      updateSearchParams({ appSeverity: undefined, appPage: 1 });
    }
  };

  const selectedValues: string[] = useMemo(() => {
    if (appSeverity) {
      return appSeverity.split(",");
    }
    return [];
  }, [appSeverity]);

  return (
    <div className="w-full max-w-xs space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="bg-transparent w-full flex items-center justify-between"
            variant={"ghost"}
          >
            <span>Severity</span>
            <span>
              <Filter
                className={`shrink-0 ${selectedValues.length > 0 ? "text-primary fill-primary" : "text-muted-foreground"}`}
                aria-hidden="true"
              />
            </span>
          </Button>
        </DropdownMenuTrigger>
        <SeverityFilters selectedValues={selectedValues} onSubmit={onSubmit} />
      </DropdownMenu>
    </div>
  );
};

export default AppSeverityHeaderFilter;
