import React from "react";
import { Skeleton } from "../ui/skeleton";

const BarChartSkeleton: React.FC = () => {
  return (
    <div className="flex gap-15 items-baseline">
      <Skeleton className="h-120 w-10" />
      <Skeleton className="h-80 w-10" />
      <Skeleton className="h-110 w-10" />
      <Skeleton className="h-100 w-10" />
    </div>
  );
};

export default BarChartSkeleton;
