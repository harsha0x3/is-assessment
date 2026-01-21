import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import React, { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { useApplicationsContext } from "../context/ApplicationsContext";

const AppPagination: React.FC = () => {
  const { appPage, goToPage, filteredApps, appPageSize } =
    useApplicationsContext();
  const totalPages: number = useMemo(() => {
    return Math.ceil((filteredApps ?? 0) / appPageSize);
  }, [filteredApps]);
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            aria-label="Go to first page"
            size="icon"
            className="rounded-full"
            onClick={() => goToPage(1)}
          >
            <ChevronFirstIcon className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            aria-label="Go to previous page"
            size="icon"
            className="rounded-full"
            onClick={() => {
              if (appPage <= 1) return;
              goToPage(appPage - 1);
            }}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <Select
            value={String(appPage)}
            aria-label="Select page"
            onValueChange={(value) => goToPage(Number(value))}
          >
            <SelectTrigger
              id="select-page"
              className="w-fit whitespace-nowrap"
              aria-label="Select page"
            >
              <SelectValue placeholder="Select page" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <SelectItem key={page} value={String(page)}>
                    Page {page}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            onClick={() => {
              if (appPage === totalPages) return;
              goToPage(appPage + 1);
            }}
            aria-label="Go to next page"
            size="icon"
            className="rounded-full"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            onClick={() => goToPage(totalPages)}
            aria-label="Go to last page"
            size="icon"
            className="rounded-full"
          >
            <ChevronLastIcon className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default AppPagination;
