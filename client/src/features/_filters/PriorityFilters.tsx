import { Button } from "@/components/ui/button";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { priorityValues } from "@/utils/globalValues";

import React, { useEffect, useState } from "react";

type Props = {
  selectedValues: string[];
  onSubmit: (data: string[]) => void;
};

const PriorityFilters: React.FC<Props> = ({ selectedValues, onSubmit }) => {
  const [toggledValues, setToggledValues] = useState<string[]>([]);

  useEffect(() => {
    if (selectedValues) {
      setToggledValues(selectedValues);
    }
  }, [selectedValues]);

  const toggleSelection = (value: string) => {
    setToggledValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  return (
    <DropdownMenuContent>
      <DropdownMenuGroup>
        {priorityValues.map((item) => (
          <DropdownMenuCheckboxItem
            checked={toggledValues.includes(item.value)}
            onSelect={(e) => {
              e.preventDefault();
              toggleSelection(item.value);
            }}
          >
            {item.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup className="flex items-center justify-between">
        <DropdownMenuItem asChild>
          <Button
            variant={"secondary"}
            size={"sm"}
            onClick={() => onSubmit(toggledValues)}
          >
            Apply
          </Button>
        </DropdownMenuItem>
        <Button
          variant={"destructive"}
          size={"sm"}
          onClick={() => {
            setToggledValues([]);
          }}
        >
          Clear
        </Button>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
};

export default PriorityFilters;
