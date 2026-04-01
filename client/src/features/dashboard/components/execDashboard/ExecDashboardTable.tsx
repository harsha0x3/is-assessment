import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import React, { lazy, Suspense, useMemo } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Hint from "@/components/ui/hint";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import AppTypeFilter from "@/features/applications/components/tableHeaders/AppTypeFilter";
import { useApplicationsContext } from "@/features/applications/context/ApplicationsContext";
import type { NewAppListOut } from "@/features/applications/types";
// import { useGetAllDepartmentsQuery } from "@/features/departments/store/departmentsApiSlice";
import type { AppDepartmentOut } from "@/features/departments/types";
import type {
  AppStatuses,
  // DeptStatuses
} from "@/utils/globalTypes";
import { STATUS_COLOR_MAP_BG, STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import {
  daysBetweenDateAndToday,
  parseDate,
  parseStatus,
  shortenDept,
} from "@/utils/helpers";
import {
  Bot,
  ClockAlert,
  FlagTriangleRight,
  Info,
  Loader,
  ShieldPlus,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
const AppStatusHeaderFilter = lazy(
  () =>
    import("@/features/applications/components/tableHeaders/AppStatusHeaderFilter"),
);
const SLAFilterHeader = lazy(
  () =>
    import("@/features/applications/components/tableHeaders/SLAFilterHeader"),
);

const ExecDashboardTable: React.FC = () => {
  const {
    data: appsData,
    isLoading: isAppsLoading,
    appStatus,
  } = useApplicationsContext();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const colHelper = createColumnHelper<NewAppListOut>();
  // const { data: allDepartments } = useGetAllDepartmentsQuery();

  const DepartmentsStatusCol: React.FC<{
    depts: AppDepartmentOut[];
    appId: string;
  }> = ({ depts, appId }) => {
    return (
      <div className="flex items-center gap-4">
        <div className="flex gap-4">
          {depts.map((d) => (
            <Hint
              key={d.id}
              label={
                <div className="text-[12px] space-y-2">
                  <p>{d.name}</p>
                  <p className="capitalize">
                    Status:{" "}
                    <span
                      style={{
                        color: STATUS_COLOR_MAP_FG[d.status as AppStatuses],
                      }}
                    >
                      {parseStatus(d.status)}
                    </span>
                  </p>
                  <Separator />
                  <div className="">
                    <p>Duration: </p>
                    <p>
                      {d?.started_at && <span>{parseDate(d.started_at)}</span>}{" "}
                      {d?.ended_at && <span> - {parseDate(d.ended_at)}</span>}
                    </p>
                  </div>
                </div>
              }
            >
              <div className="flex flex-col items-center cursor-default">
                {appStatus === "go_live" ? (
                  <FlagTriangleRight
                    className="w-3 h-3"
                    fill={
                      d.status === "go_live"
                        ? STATUS_COLOR_MAP_FG[d.status as AppStatuses]
                        : "none"
                    }
                  />
                ) : (
                  <span
                    key={d.id}
                    className="h-4 w-4 rounded-md"
                    style={{
                      backgroundColor:
                        STATUS_COLOR_MAP_FG[d.status as AppStatuses],
                    }}
                  />
                )}
                <span
                  className="hover:underline hover:text-ring hover:cursor-pointer transition-all whitespace-nowrap"
                  onClick={() =>
                    navigate(
                      `details/${appId}/departments/${d.id}/comments?${searchParams.toString()}`,
                    )
                  }
                >
                  {shortenDept(d.name.toLowerCase())}
                </span>
              </div>
            </Hint>
          ))}
        </div>
      </div>
    );
  };

  // const departmentColumns: ColumnDef<NewAppListOut, DeptStatuses | "N/A">[] =
  //   useMemo(() => {
  //     if (!allDepartments?.data) return [];

  //     return allDepartments.data.map((dept) =>
  //       colHelper.accessor(
  //         (row) => {
  //           const appDept = row.departments?.find((d) => d.id === dept.id);
  //           return appDept;
  //         },
  //         {
  //           id: `department-${dept.id}`,
  //           header: () => dept.name,
  //           minSize: 100,
  //           maxSize: 100,
  //           cell: (info) => {
  //             const appDept = info.getValue();
  //             const status = appDept ? appDept.status : "N/A";
  //             const startDate = appDept
  //               ? parseDate(appDept.started_at)
  //               : undefined;
  //             const endDate = appDept ? parseDate(appDept.ended_at) : undefined;
  //             return (
  //               <div>
  //                 <Badge
  //                   variant="outline"
  //                   className={`capitalize ${
  //                     status === "go_live"
  //                       ? "border-2 border-gray-500 rounded-xl"
  //                       : ""
  //                   }`}
  //                   style={{
  //                     backgroundColor:
  //                       STATUS_COLOR_MAP_BG[status as AppStatuses],
  //                     color: STATUS_COLOR_MAP_FG[status as AppStatuses],
  //                   }}
  //                 >
  //                   {parseStatus(status)}
  //                 </Badge>
  //                 <p>
  //                   {startDate && <span>{startDate}</span>}{" "}
  //                   {endDate && <span>- {endDate}</span>}
  //                 </p>
  //               </div>
  //             );
  //           },
  //         },
  //       ),
  //     );
  //   }, [allDepartments, colHelper]);

  const columns: ColumnDef<NewAppListOut, any>[] = useMemo(() => {
    if (isAppsLoading) return [];

    return [
      colHelper.accessor("name", {
        header: () => <AppTypeFilter />,
        minSize: 280,
        maxSize: 550,
        cell: ({ row, getValue }) => {
          const dueDays = daysBetweenDateAndToday(row.original.due_date);
          const isAppAi = row.original.is_app_ai;
          const isAppPrivacy = row.original.is_privacy_applicable;

          return (
            <Button
              variant="link"
              className="p-0 h-auto text-left text-primary"
              onClick={() =>
                navigate(
                  `details/${row.original.id}/overview?${searchParams.toString()}`,
                )
              }
            >
              <span className="whitespace-normal wrap-break-word">
                {Number(dueDays) > 0 && (
                  <Hint label={`Overdue by ${dueDays} days`}>
                    <ClockAlert className="inline mr-1 text-amber-500" />
                  </Hint>
                )}
                {isAppAi && (
                  <Hint label="AI Application">
                    <Bot
                      strokeWidth={3}
                      className="inline mr-1 text-purple-500"
                    />
                  </Hint>
                )}
                {isAppPrivacy && (
                  <Hint label="Privacy Application">
                    <ShieldPlus
                      strokeWidth={4}
                      className="inline mr-1 text-indigo-400"
                    />
                  </Hint>
                )}
                {getValue()}
              </span>

              <HoverCard openDelay={10} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <Info className="text-blue-500" />
                </HoverCardTrigger>
                <HoverCardContent className="w-fit" side="top" align="start">
                  {row.original.departments?.length ? (
                    <DepartmentsStatusCol
                      depts={row.original.departments}
                      appId={row.original.id}
                    />
                  ) : (
                    <p>No Data to be shown</p>
                  )}
                </HoverCardContent>
              </HoverCard>
            </Button>
          );
        },
      }),
      colHelper.accessor("status", {
        header: () => (
          <Suspense fallback={"Status"}>
            <AppStatusHeaderFilter />
          </Suspense>
        ),
        maxSize: 140,
        minSize: 80,
        cell: (info) => {
          const status: AppStatuses = info.getValue();
          return (
            <div className=" w-full pl-4">
              <Badge
                className={`capitalize ${status === "go_live" ? "border-2 border-gray-500 rounded-xl" : ""}`}
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
        header: () => (
          <Suspense fallback="Duration">
            <SLAFilterHeader />
          </Suspense>
        ),
        maxSize: 150,
        minSize: 120,
        cell: (info) => {
          const rawDate = info.getValue(); // "2026-01-11"

          return rawDate ? (
            <div className="w-full">
              <p>Started: {parseDate(rawDate)}</p>
              <p className="text-muted-foreground">
                {daysBetweenDateAndToday(rawDate)} Days ago
              </p>
            </div>
          ) : (
            "-"
          );
        },
      }),
      colHelper.accessor("departments", {
        header: "Departments",
        minSize: 300,
        cell: ({ getValue, row }) => (
          <DepartmentsStatusCol depts={getValue()} appId={row.original.id} />
        ),
      }),
      //   ...departmentColumns,
    ];
  }, [isAppsLoading, navigate, searchParams, colHelper]);
  const table = useReactTable({
    data: appsData?.data.apps ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
  });

  return (
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
            isAppsLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-6 capitalize"
                >
                  <div>
                    <Loader className="animate-spin w-5 h-5" />
                    <p>Loading..</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-6 capitalize"
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
                    className={`whitespace-normal wrap-break-word capitalize`}
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

export default ExecDashboardTable;
