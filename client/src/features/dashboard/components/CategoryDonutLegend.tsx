// CategoryDonutLegend.tsx
import React from "react";
import { categoryDonutConfig } from "@/lib/chartConfig";

interface LegendItem {
  name: string;
  count: number;
  value: number; // percent
}

const CategoryDonutLegend: React.FC<{ data: LegendItem[] }> = ({ data }) => {
  return (
    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
      {data.map((item) => {
        const config = categoryDonutConfig[item.name.toLowerCase()];

        if (!config) return null;

        return (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-muted-foreground">{config.label}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-foreground">{item.count}</span>
              <span className="text-muted-foreground">({item.value}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryDonutLegend;
