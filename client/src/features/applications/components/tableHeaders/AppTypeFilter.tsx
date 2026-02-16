import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Filter } from "lucide-react";
import React from "react";
import { useApplicationsContext } from "../../context/ApplicationsContext";

const AppTypeFilter: React.FC = () => {
  const {
    webAppsFilter,
    aiAppsFilter,
    mobileAppsFilter,
    mobileWebAppsFilter,
    updateSearchParams,
  } = useApplicationsContext();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="bg-transparent w-full flex items-center justify-between"
          variant={"ghost"}
        >
          <span>Name</span>
          <span>
            <Filter
              className={`shrink-0 ${!!webAppsFilter || !!mobileAppsFilter || !!mobileWebAppsFilter || !!aiAppsFilter ? "text-primary fill-primary" : "text-muted-foreground"}`}
              aria-hidden="true"
            />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>App type filters</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>AI Apps</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => updateSearchParams({ aiAppsFilter: "true" })}
                >
                  {aiAppsFilter === "true" && <Check />}
                  True
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateSearchParams({ aiAppsFilter: "false" })}
                >
                  {aiAppsFilter === "false" && <Check />}
                  False
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateSearchParams({ aiAppsFilter: undefined })
                  }
                >
                  Clear
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          {/* Web Apps */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Web Apps</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => updateSearchParams({ webAppsFilter: "true" })}
                >
                  {webAppsFilter === "true" && <Check />}
                  True
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateSearchParams({ webAppsFilter: "false" })}
                >
                  {webAppsFilter === "false" && <Check />}
                  False
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateSearchParams({ webAppsFilter: undefined })
                  }
                >
                  Clear
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Mobile Apps */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Mobile Apps</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() =>
                    updateSearchParams({ mobileAppsFilter: "true" })
                  }
                >
                  {mobileAppsFilter === "true" && <Check />}
                  True
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateSearchParams({ mobileAppsFilter: "false" })
                  }
                >
                  {mobileAppsFilter === "false" && <Check />}
                  False
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateSearchParams({ mobileAppsFilter: undefined })
                  }
                >
                  Clear
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Both */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Mobile & Web Apps</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() =>
                    updateSearchParams({ mobileWebappsFilter: "true" })
                  }
                >
                  {mobileWebAppsFilter === "true" && <Check />}
                  True
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateSearchParams({ mobileWebAppsFilter: "false" })
                  }
                >
                  {mobileWebAppsFilter === "false" && <Check />}
                  False
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateSearchParams({ mobileWebAppsFilter: undefined })
                  }
                >
                  Clear
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AppTypeFilter;
