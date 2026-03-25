import { useId, useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

import {
  useGetAllVerticalsQuery,
  useCreateVerticalMutation,
} from "../store/verticalsApiSlice";
import { toast } from "sonner";

interface Props {
  value: number[];
  onChange: (val: number[]) => void;
  label?: string;
  canCreate?: boolean;
}

export const VerticalsMultiSelect = ({
  value,
  onChange,
  label = "Verticals",
  canCreate = false,
}: Props) => {
  const id = useId();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useGetAllVerticalsQuery();
  const [createVertical, { isLoading: isCreating }] =
    useCreateVerticalMutation();

  const [selectedValues, setSelectedValues] = useState<number[]>(value || []);
  const [search, setSearch] = useState("");
  const [creatingMode, setCreatingMode] = useState(false);
  const [newVertical, setNewVertical] = useState("");

  const verticals = data ?? [];

  console.log("VERTICALS😒", verticals);

  const toggleSelection = (id: number) => {
    let updated: number[];

    if (selectedValues.includes(id)) {
      updated = selectedValues.filter((v) => v !== id);
    } else {
      updated = [...selectedValues, id];
    }

    setSelectedValues(updated);
    onChange(updated);
  };

  const handleCreate = async () => {
    if (!newVertical.trim()) return;

    try {
      const res = await createVertical({
        name: newVertical,
        description: "",
      }).unwrap();

      const newId = res.id;

      const updated = [...selectedValues, newId];
      setSelectedValues(updated);
      onChange(updated);

      setNewVertical("");
      setCreatingMode(false);
    } catch {
      toast.error("Failed to create vertical. Please try again.");
    }
  };

  return (
    <div className="w-full space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-auto min-h-9 w-full justify-between"
          >
            {selectedValues.length > 0 ? (
              <span>
                <Badge variant="outline">{selectedValues.length}</Badge>{" "}
                selected
              </span>
            ) : (
              <span className="text-muted-foreground">Select verticals</span>
            )}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-(--radix-popper-anchor-width) p-0">
          <Command>
            {/* SEARCH */}
            <CommandInput
              placeholder="Search vertical..."
              value={search}
              onValueChange={setSearch}
            />

            <CommandList>
              {isLoading && (
                <div className="p-2 flex items-center gap-2 text-sm">
                  <Loader2 className="animate-spin" size={14} />
                  Loading...
                </div>
              )}

              {!isLoading && verticals.length === 0 && (
                <CommandEmpty>No vertical found.</CommandEmpty>
              )}

              <CommandGroup>
                {verticals
                  .filter((v) =>
                    v.name.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((v) => (
                    <CommandItem
                      key={v.id}
                      value={v.name}
                      onSelect={() => toggleSelection(v.id)}
                    >
                      <span>{v.name}</span>
                      {selectedValues.includes(v.id) && (
                        <CheckIcon size={16} className="ml-auto" />
                      )}
                    </CommandItem>
                  ))}
              </CommandGroup>

              {/* CREATE NEW */}
              {canCreate && (
                <div className="border-t p-2 space-y-2">
                  {!creatingMode ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setCreatingMode(true)}
                    >
                      <PlusIcon size={14} className="mr-2" />
                      Add new vertical
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter name"
                        value={newVertical}
                        onChange={(e) => setNewVertical(e.target.value)}
                      />
                      <Button
                        size="sm"
                        onClick={handleCreate}
                        disabled={isCreating}
                      >
                        {isCreating ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
