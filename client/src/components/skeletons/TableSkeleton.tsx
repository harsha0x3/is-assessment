import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  columns = 7,
  rows = 8,
}) => {
  return (
    <div className="w-full h-full overflow-auto border rounded-md">
      <Table className="table-fixed">
        {/* Header */}
        <TableHeader className="bg-accent sticky top-0 z-10">
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i} className="h-10">
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* Body */}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRow key={rowIdx} className="max-h-40">
              {Array.from({ length: columns }).map((_, colIdx) => (
                <TableCell key={colIdx} className="py-3">
                  <Skeleton
                    className={`h-4 ${
                      colIdx === 0
                        ? "w-48"
                        : colIdx === 1
                          ? "w-64"
                          : colIdx % 2 === 0
                            ? "w-28"
                            : "w-20"
                    }`}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableSkeleton;
