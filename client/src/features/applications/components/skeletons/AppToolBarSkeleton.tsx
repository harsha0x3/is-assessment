// AppsToolbarSkeleton.tsx
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AppsToolbarSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between h-12 px-1 rounded-md bg-accent mt-2">
      {/* Left section */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-64 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Right section */}
      <div className="hidden md:block">
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  );
};

export default AppsToolbarSkeleton;
