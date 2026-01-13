// src\features\departments\components\DepartmentsMultiSelect.tsx

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DepartmentOut } from "@/features/departments/types";

interface Props {
  value: number[];
  departments: DepartmentOut[];
  onChange: (value: number[]) => void;
}

export function DepartmentsMultiSelect({
  value,
  departments,
  onChange,
}: Props) {
  const toggle = (id: number) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {value.length
            ? `${value.length} department(s) selected`
            : "Select departments"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-75 p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {departments.map((dept) => (
                <CommandItem key={dept.id} onSelect={() => toggle(dept.id)}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(dept.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {dept.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
