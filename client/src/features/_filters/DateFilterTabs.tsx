import React, { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { PRESET_RANGES } from "@/utils/dateRangeOptions";
import DateRangePicker from "@/components/ui/date-range-picker";
import { CalendarIcon } from "lucide-react";

type Props = {
  initialFrom?: string;
  initialTo?: string;
  onApply: (params: { from?: string; to?: string }) => void;
};

const format = (date?: Date) => {
  if (!date) return undefined;
  return date.toISOString().split("T")[0];
};

const DateFilterTabs: React.FC<Props> = ({
  initialFrom,
  initialTo,
  onApply,
}) => {
  const [tab, setTab] = useState<"default" | "custom">("default");

  const [range, setRange] = useState<DateRange | undefined>(
    initialFrom || initialTo
      ? {
          from: initialFrom ? new Date(initialFrom) : undefined,
          to: initialTo ? new Date(initialTo) : undefined,
        }
      : undefined,
  );

  /**
   * Determine which preset matches the search params
   */
  const selectedPreset = useMemo(() => {
    if (!initialFrom || !initialTo) return null;

    return PRESET_RANGES.find((preset) => {
      const { from, to } = preset.getRange();

      return format(from) === initialFrom && format(to) === initialTo;
    })?.label;
  }, [initialFrom, initialTo]);

  const applyPreset = (getRange: () => { from: Date; to: Date }) => {
    const { from, to } = getRange();

    onApply({
      from: format(from),
      to: format(to),
    });
  };

  const display = (date?: string) =>
    date ? new Date(date).toLocaleDateString() : "";

  return (
    <div className="space-y-2">
      {/* Selected Range Display */}
      <div className="flex items-center gap-2 text-sm font-medium">
        <CalendarIcon
          className={`h-4 w-4 ${!!initialFrom || !!initialTo ? "text-primary" : ""}`}
        />
        {initialFrom && initialTo ? (
          <span>
            {display(initialFrom)} {"  "} – {"  "}
            {display(initialTo)}
          </span>
        ) : (
          <span className="text-muted-foreground">No date selected</span>
        )}
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as any)}
        className="w-full"
      >
        <div className="flex justify-center">
          <TabsList className="grid grid-cols-2 w-fit">
            <TabsTrigger value="default">Preset</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
        </div>

        {/* DEFAULT PRESETS */}
        <TabsContent value="default">
          <div className="space-y-2">
            {PRESET_RANGES.map((preset) => {
              const isSelected = preset.label === selectedPreset;

              return (
                <Button
                  key={preset.label}
                  variant={isSelected ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => applyPreset(preset.getRange)}
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>
        </TabsContent>

        {/* CUSTOM RANGE */}
        <TabsContent value="custom">
          <div className="space-y-3">
            <DateRangePicker range={range} setRange={setRange} />

            <div className="flex gap-2 justify-end">
              <Button
                disabled={
                  !initialFrom && !initialTo && !range?.from && !range?.to
                }
                onClick={() =>
                  onApply({
                    from: format(range?.from),
                    to: format(range?.to),
                  })
                }
              >
                Apply
              </Button>
              <Button
                variant={"destructive"}
                disabled={!range?.from && !range?.to}
                onClick={() => setRange({ from: undefined, to: undefined })}
              >
                Clear
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end">
        <Button
          variant={"destructive"}
          size={"sm"}
          onClick={() =>
            onApply({
              from: undefined,
              to: undefined,
            })
          }
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default DateFilterTabs;
