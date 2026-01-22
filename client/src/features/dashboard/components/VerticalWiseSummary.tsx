import React, { lazy, Suspense, useMemo } from "react";
import { useGetVerticalWiseSummaryQuery } from "../store/dashboardApiSlice";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { VerticalStatusSummary } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InlineLoader } from "@/components/loaders/InlineLoader";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const VerticalsStatusProgressBar = lazy(
  () => import("./VerticalsStatusProgressBar"),
);

const VerticalWiseSummary: React.FC = () => {
  const { data, isLoading, error } = useGetVerticalWiseSummaryQuery();
  const colHelper = createColumnHelper<VerticalStatusSummary>();
  const [search, setSearch] = React.useState("");
  const navigate = useNavigate();

  const columns: ColumnDef<VerticalStatusSummary, any>[] = useMemo(() => {
    return [
      colHelper.accessor("vertical", {
        header: "Vertical",
        minSize: 60,
        maxSize: 70,
        cell: (info) => {
          return (
            <Button
              variant={"link"}
              className="text-primary"
              onClick={() =>
                navigate(
                  `/applications?appVertical=${info.getValue().toLowerCase()}`,
                )
              }
            >
              {info.getValue()}
            </Button>
          );
        },
      }),
      colHelper.accessor("total", {
        minSize: 30,
        maxSize: 40,
        header: "Total",
        cell: (info) => {
          return <p className="w-full text-center">{info.getValue()}</p>;
        },
      }),
      colHelper.accessor("statuses", {
        header: "Status Summary",
        minSize: 300,
        size: 320,
        maxSize: 400,
        cell: ({ row, getValue }) => {
          const vertical = row.original.vertical;
          const data = getValue();
          return (
            <Suspense>
              <VerticalsStatusProgressBar
                vertical={vertical}
                statuses={data}
                total={row.original.total}
              />
            </Suspense>
          );
        },
      }),
    ];
  }, [data, isLoading]);
  const filteredData = useMemo(() => {
    if (!data || !search.trim()) return data ?? [];

    const q = search.toLowerCase();

    return data.filter((item) => item.vertical.toLowerCase().includes(q));
  }, [data, search]);

  const table = useReactTable({
    data: filteredData ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
  });
  return (
    <>
      <CardHeader className="py-0 gap-0">
        <div className="flex flex-col sm:flex-row sm:items-center w-full">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vertical..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <CardTitle className="sm:flex-1 text-center">
            Vertical Wise Applications Summary
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="h-135 overflow-auto">
        <div className="w-full h-full overflow-x-auto overflow-y-auto border rounded-md">
          <Table className="table-fixed">
            <TableHeader className="bg-accent text-accent-foreground sticky">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="text-ring">
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="group/head text-md whitespace-normal wrap-break-word group/head relative h-10 select-none last:[&>.cursor-col-resize]:opacity-0 text-ring text-md font-semibold"
                      {...{
                        colSpan: header.colSpan,
                        style: {
                          width: header.getSize(),
                        },
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getCanResize() && (
                        <div
                          {...{
                            onDoubleClick: () => header.column.resetSize(),
                            onMouseDown: header.getResizeHandler(),
                            onTouchStart: header.getResizeHandler(),
                            className:
                              "group-last/head:hidden absolute top-0 h-full w-4 cursor-col-resize user-select-none touch-none -right-2 z-10 flex justify-center before:absolute before:w-px before:inset-y-0 before:bg-border before:translate-x-px",
                          }}
                        />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-6"
                    >
                      <div>
                        <InlineLoader />
                        <p>Loading..</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <p>
                    {getApiErrorMessage(error) ??
                      "Error getting the vertical wise app summary"}
                  </p>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-6"
                    >
                      No data found.
                    </TableCell>
                  </TableRow>
                )
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={`max-h-40 whitespace-normal wrap-break-word`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={`whitespace-normal wrap-break-word`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </>
  );
};

export default VerticalWiseSummary;
