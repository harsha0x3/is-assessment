import React from "react";
import type { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./calendar";

type Props = {
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
};

const DateRangePicker: React.FC<Props> = ({ range, setRange }) => {
  const daysBetween = React.useMemo(() => {
    if (!range?.from || !range?.to) return null;

    const from = new Date(range?.from);
    const to = new Date(range?.to);

    const diff = to.getTime() - from.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1; // +1 if you want inclusive
  }, [range?.from, range?.to]);

  return (
    <div className="w-full">
      <p className="flex items-center gap-2">
        <CalendarIcon />
        {range?.from && range?.to
          ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
          : "Select Date Range"}
      </p>

      <Calendar
        className="w-full"
        mode="range"
        selected={range}
        onSelect={setRange}
        defaultMonth={range?.from}
        fixedWeeks
        showOutsideDays
        captionLayout="dropdown"
        startMonth={new Date(2024, 0)}
        endMonth={new Date()}
        disabled={{
          after: new Date(),
        }}
      />
      {daysBetween !== null && daysBetween >= 0 && (
        <div className="text-sm text-muted-foreground">
          {daysBetween} day{daysBetween !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
