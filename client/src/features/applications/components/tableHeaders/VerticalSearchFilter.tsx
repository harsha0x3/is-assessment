import { Button } from "@/components/ui/button";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDownIcon, Search, XCircleIcon } from "lucide-react";

import Hint from "@/components/ui/hint";
import { useApplicationsContext } from "../../context/ApplicationsContext";
import { Input } from "@/components/ui/input";

const VerticalSearchFilter: React.FC = () => {
  const { appVertical, updateSearchParams } = useApplicationsContext();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={"vertical-filter-trigger"}
          variant="outline"
          role="combobox"
          className="h-auto min-h-8 w-full justify-between bg-transparent border-none shadow-none font-semibold"
        >
          <span className="text-ring">Vertical</span>
          <ChevronsUpDownIcon
            className="text-muted-foreground/80 shrink-0"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" side="top">
        <div className="w-full sm:w-65 min-w-60 flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary h-4 w-4" />
            <Input
              type="text"
              value={appVertical ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                updateSearchParams({ appVertical: e.target.value });
              }}
              placeholder={`Enter vertical name`}
              className="w-full pl-10 pr-3 py-2 border"
            />
          </div>
          <Hint label="Clear">
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => updateSearchParams({ appVertical: undefined })}
            >
              <XCircleIcon />
            </Button>
          </Hint>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default VerticalSearchFilter;
