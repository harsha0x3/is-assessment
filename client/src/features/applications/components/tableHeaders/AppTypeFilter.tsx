import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Filter } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useApplicationsContext } from "../../context/ApplicationsContext";

const AppTypeFilter: React.FC = () => {
  const { appType, appFeatures, updateSearchParams } = useApplicationsContext();

  const [appTypeFiltes, setApptypeFilters] = useState<string[]>([]);
  const [appFeaturesFiltes, setAppFeaturesFilters] = useState<string[]>([]);

  useEffect(() => {
    if (appType) {
      setApptypeFilters(appType.split(","));
    } else {
      setAppFeaturesFilters([]);
    }
    if (appFeatures) {
      setAppFeaturesFilters(appFeatures.split(","));
    } else {
      setAppFeaturesFilters([]);
    }
  }, [appType, appFeatures]);

  const toggleAppTypeSelection = (value: string) => {
    setApptypeFilters((prev) => {
      const updated = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];

      if (updated.length > 0) {
        updateSearchParams({ appType: updated.join(","), appPage: 1 });
      } else {
        updateSearchParams({ appType: undefined, appPage: 1 });
      }

      return updated;
    });
  };
  const toggleAppFeaturesSelection = (value: string) => {
    setAppFeaturesFilters((prev) => {
      const updated = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];

      if (updated.length > 0) {
        updateSearchParams({ appFeatures: updated.join(","), appPage: 1 });
      } else {
        updateSearchParams({ appFeatures: undefined, appPage: 1 });
      }

      return updated;
    });
  };

  const appTypeValues: { value: string; label: string }[] = [
    { value: "web", label: "Web" },
    { value: "mobile", label: "Mobile" },
    { value: "mobile_web", label: "Mobile & Web" },
    { value: "api", label: "API" },
    { value: "desktop", label: "Desktop" },
  ];

  const appFeaturesValues: { value: string; label: string }[] = [
    { value: "ai", label: "AI" },
    { value: "privacy", label: "Privacy" },
  ];

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
              className={`shrink-0 ${!!appType || !!appFeatures ? "text-primary fill-primary" : "text-muted-foreground"}`}
              aria-hidden="true"
            />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>App type filters</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {appTypeValues.map((item) => (
            <DropdownMenuItem
              onClick={() => toggleAppTypeSelection(item.value)}
            >
              {appTypeFiltes.includes(item.value) && <Check />}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {appFeaturesValues.map((item) => (
            <DropdownMenuItem
              onClick={() => toggleAppFeaturesSelection(item.value)}
            >
              {appFeaturesFiltes.includes(item.value) && <Check />}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setAppFeaturesFilters([]);
            setApptypeFilters([]);
            updateSearchParams({
              appType: undefined,
              appFeatures: undefined,
            });
          }}
          className="text-destructive"
        >
          Clear All
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AppTypeFilter;
