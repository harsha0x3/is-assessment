import { Button } from "@/components/ui/button";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckCheck, Filter, Search, XCircleIcon } from "lucide-react";

import Hint from "@/components/ui/hint";
import { useApplicationsContext } from "../../context/ApplicationsContext";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

const VerticalSearchFilter: React.FC = () => {
  const { appVertical, updateSearchParams } = useApplicationsContext();
  const [searchTerm, setSearchTerm] = useState<string>();
  useEffect(() => {
    if (!!appVertical) {
      setSearchTerm(appVertical);
    }
  });
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={"vertical-filter-trigger"}
          variant="ghost"
          role="combobox"
          className="h-auto min-h-8 w-full justify-between bg-none border-none shadow-none font-semibold"
        >
          <span className="text-ring">Vertical</span>
          <Filter
            className={`shrink-0 ${!!appVertical ? "text-primary fill-primary" : "text-muted-foreground"}`}
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-84" side="top">
        <div className="w-full sm:w-72 min-w-70 flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary h-4 w-4" />
            <Input
              type="text"
              value={searchTerm ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(e.target.value);
              }}
              placeholder={`Enter vertical name`}
              className="w-full pl-10 pr-3 py-2 border"
            />
          </div>
          <Hint label="Apply">
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => updateSearchParams({ appVertical: searchTerm })}
            >
              <CheckCheck />
            </Button>
          </Hint>
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
