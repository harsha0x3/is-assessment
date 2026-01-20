import React from "react";
import { useApplications } from "../hooks/useApplications";
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
import { Check, SlidersHorizontalIcon } from "lucide-react";

const AppFilters: React.FC = () => {
  const { updateSearchParams, appSearchBy, appSortBy, appSortOrder } =
    useApplications();

  const validSearchBys = [
    { name: "Name" },
    { ticket_id: "Ticket ID" },
    { environment: "Environment" },
    { vendor_company: "Vendor Company" },
    { vertical: "Vertical" },
  ];

  const validSortBys = [
    { name: "Name" },
    { created_at: "Start Date" },
    { updated_at: "Updated Date" },
    { app_priority: "Priority" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="px-1">
          <SlidersHorizontalIcon /> Filters
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>App Filters</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Search By</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {validSearchBys.map((item, idx) => {
                  const [val, label] = Object.entries(item)[0];
                  return (
                    <DropdownMenuItem
                      key={idx}
                      data-value={val}
                      onClick={() => updateSearchParams({ appSearchBy: val })}
                    >
                      {appSearchBy == val && <Check />}

                      {label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          {/* Sort Order filters*/}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Sort order</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  data-value="asc"
                  onClick={() =>
                    updateSearchParams({ appSortOrder: "asc", appPage: 1 })
                  }
                >
                  {appSortOrder == "asc" && <Check />}
                  Ascending
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-value="desc"
                  onClick={() =>
                    updateSearchParams({ appSortOrder: "desc", appPage: 1 })
                  }
                >
                  {appSortOrder == "desc" && <Check />}
                  Descending
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          {/* Sort By filters*/}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Sort By</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {validSortBys.map((item, idx) => {
                  const [val, label] = Object.entries(item)[0];
                  return (
                    <DropdownMenuItem
                      key={idx}
                      data-value={val}
                      onClick={() =>
                        updateSearchParams({ appSortBy: val, appPage: 1 })
                      }
                    >
                      {appSortBy == val && <Check />}

                      {label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AppFilters;
