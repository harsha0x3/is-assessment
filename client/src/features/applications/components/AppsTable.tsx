import React, { lazy, Suspense, useMemo, useState } from "react";
import useApplications from "../hooks/useApplications";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type { NewAppListOut } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useGetAllDepartmentsQuery } from "@/features/departments/store/departmentsApiSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AppDeptData } from "@/features/departments/components/AppDepartmentDialog";
import { useNavigate } from "react-router-dom";
import DescriptionCell from "@/components/ui/description-cell";
import { parseDate, parseStatus } from "@/utils/helpers";
import { STATUS_COLOR_MAP_BG, STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import type { AppStatuses } from "@/utils/globalTypes";
const AppsTable: React.FC = () => {
  const AppDepartmentDialog = lazy(
    () => import("@/features/departments/components/AppDepartmentDialog")
  );

  const { data: appsData, isLoading: isAppsLoading } = useApplications();
  const { data: departments, isLoading: isLoadingDepts } =
    useGetAllDepartmentsQuery();
  const [showDeptDialog, setShowDeptDialog] = useState(false);
  const [deptDialogProps, setDeptDialogProps] = useState<AppDeptData | null>();
  const navigate = useNavigate();
  const colHelper = createColumnHelper<NewAppListOut>();

  const deptCols = useMemo<ColumnDef<NewAppListOut, any>[]>(() => {
    if (!Array.isArray(departments?.data)) {
      return [];
    }
    if (departments.data && Array.isArray(departments.data)) {
      return departments.data.map((dept) =>
        colHelper.display({
          id: `dept-${dept.name}`,
          header: () => <span className="capitalize">{dept.name}</span>,
          minSize: 120,
          cell: ({ row }) => {
            const appDept = row.original.departments?.find(
              (d) => d.name === dept.name
            );
            if (!appDept) return "-";
            return (
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`group/dept`}
                  onClick={() => {
                    setShowDeptDialog(true);
                    setDeptDialogProps({
                      deptId: appDept.id,
                      appId: row.original.id,
                      appName: row.original.name,
                      deptName: appDept.name,
                    });
                  }}
                  asChild
                >
                  <Badge
                    variant="outline"
                    className={`relative overflow-hidden text-xs ${
                      appDept.status === "pending"
                        ? "bg-amber-300/35 text-amber-600"
                        : appDept.status === "in-progress"
                        ? "bg-blue-300/35 text-blue-600"
                        : appDept.status === "completed"
                        ? "bg-green-300/35 text-green-600"
                        : appDept.status === "rejected"
                        ? "bg-red-300/35 text-red-600"
                        : ""
                    }`}
                  >
                    {/* Default text */}
                    <span className="block transition-opacity duration-200 group-hover/dept:opacity-0">
                      {appDept.status}
                    </span>

                    {/* Hover text */}
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/dept:opacity-100">
                      View
                    </span>
                  </Badge>
                </Button>
                {/* <Button variant="ghost">View</Button> */}
              </div>
            );
          },
        })
      );
    }
    return [];
  }, [departments, isLoadingDepts]);

  const columns: ColumnDef<NewAppListOut, any>[] = useMemo(() => {
    if (!isAppsLoading) {
      return [
        colHelper.accessor("name", {
          header: "Name",
          minSize: 300,
          maxSize: 550,
          cell: ({ row, getValue }) => (
            <Button
              variant="link"
              className="p-0 h-auto text-left"
              onClick={() => {
                navigate(`/applications/details/${row.original.id}/overview`);
              }}
            >
              <span className="whitespace-normal wrap-break-word">
                {getValue()}
              </span>
            </Button>
          ),
        }),

        colHelper.accessor("description", {
          header: "Description",
          maxSize: 400,
          minSize: 250,
          cell: (info) => {
            const content: string = info.getValue() ?? "-";
            return <DescriptionCell content={content} />;
          },
        }),

        colHelper.accessor("vertical", {
          header: "Vertical",
          maxSize: 150,
          minSize: 200,
          cell: (info) => {
            return <span>{info.getValue()}</span>;
          },
        }),
        colHelper.accessor("status", {
          header: "Status",
          maxSize: 180,
          minSize: 100,
          cell: (info) => {
            const status: AppStatuses = info.getValue();
            return (
              <div className="text-center w-full">
                <Badge
                  className="capitalize"
                  style={{
                    backgroundColor: STATUS_COLOR_MAP_BG[status],
                    color: STATUS_COLOR_MAP_FG[status],
                  }}
                >
                  {parseStatus(status)}
                </Badge>
              </div>
            );
          },
        }),
        colHelper.accessor("started_at", {
          header: "Start Date",
          maxSize: 100,
          minSize: 80,
          cell: (info) => {
            const startDate = parseDate(info.getValue());
            return <div className="text-center w-full">{startDate}</div>;
          },
        }),
        colHelper.accessor("completed_at", {
          header: "End Date",
          maxSize: 100,
          minSize: 80,
          cell: (info) => {
            const endDate = parseDate(info.getValue());
            return <div className="text-center w-full">{endDate}</div>;
          },
        }),

        // ...deptCols,

        colHelper.accessor("imitra_ticket_id", {
          header: "I Mitra Ticket",
          maxSize: 180,
          minSize: 120,
          cell: (info) => <span>{info.getValue()}</span>,
        }),
      ];
    }
    return [];
  }, [appsData, isAppsLoading, deptCols]);
  const table = useReactTable({
    data: appsData?.data.apps ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
  });
  return (
    <div className="w-full h-full overflow-x-auto overflow-y-auto border rounded-md">
      {showDeptDialog && deptDialogProps && (
        <Suspense fallback={<div>Loading department dialog</div>}>
          <AppDepartmentDialog
            data={deptDialogProps}
            isOpen={showDeptDialog}
            onOpenChange={() => {
              setDeptDialogProps(null);
              setShowDeptDialog(false);
            }}
          />
        </Suspense>
      )}
      <Table
        style={{
          width: table.getCenterTotalSize(),
        }}
        className="table-fixed"
      >
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
                        header.getContext()
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
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-6">
                No data found.
              </TableCell>
            </TableRow>
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppsTable;
