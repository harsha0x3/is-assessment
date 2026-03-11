import React from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { PRESET_RANGES } from "@/utils/dateRangeOptions";
import DateFilterTabs from "./DateFilterTabs";
type Props = {
  from?: string;
  to?: string;
  onChange: (range: { from?: string; to?: string }) => void;
};

const formatDisplay = (date?: string) =>
  date ? new Date(date).toLocaleDateString() : "";

const DateRangeFilter: React.FC<Props> = ({ from, to, onChange }) => {
  const selectedPreset = React.useMemo(() => {
    if (!from || !to) return null;

    const format = (d: Date) => d.toISOString().split("T")[0];

    return PRESET_RANGES.find((preset) => {
      const { from: f, to: t } = preset.getRange();
      return format(f) === from && format(t) === to;
    })?.label;
  }, [from, to]);

  const label = selectedPreset
    ? selectedPreset
    : from && to
      ? `${formatDisplay(from)} – ${formatDisplay(to)}`
      : "Select date range";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 font-normal"
        >
          <CalendarIcon
            className={`h-4 w-4 ${!!from || !!to ? "text-primary" : ""}`}
            strokeWidth={!!from || !!to ? 4 : 2}
          />

          <span>{label}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px]">
        <DateFilterTabs
          initialFrom={from}
          initialTo={to}
          onApply={(range) => {
            onChange(range);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeFilter;
