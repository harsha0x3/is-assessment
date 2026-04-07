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
import type { AppDeptOutWithLatestComment } from "@/features/departments/types";
import type {
  AppStatuses,
  // DeptStatuses
} from "@/utils/globalTypes";
import { STATUS_COLOR_MAP_BG, STATUS_COLOR_MAP_FG } from "@/utils/globalValues";
import {
  daysBetweenDateAndToday,
  daysBetweenDates,
  parseDate,
  parseStatus,
  shortenDept,
} from "@/utils/helpers";
import {
  Bot,
  ClockAlert,
  FlagTriangleRight,
  Loader,
  ShieldPlus,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import ExecSummaryItem from "@/features/exec_sumary/components/ExecSummaryItem";

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
    depts: AppDeptOutWithLatestComment[];
    appId: string;
  }> = ({ depts }) => {
    return (
      <div className="flex items-center gap-4">
        <div className="flex gap-4">
          {depts.map((d) => (
            <HoverCard openDelay={100} closeDelay={200}>
              <HoverCardTrigger>
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
                  <span className="whitespace-nowrap">
                    {shortenDept(d.name.toLowerCase())}
                  </span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-lg p-4 text-black" side="top">
                <div className="flex flex-col gap-2">
                  {/* Department Name and Status */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{d.name}</h3>
                    <Badge
                      className={`capitalize ${d.status === "go_live" ? "border-2 border-gray-500 rounded-xl" : ""}`}
                      style={{
                        backgroundColor: STATUS_COLOR_MAP_BG[d.status],
                        color: STATUS_COLOR_MAP_FG[d.status],
                      }}
                    >
                      {parseStatus(d.status)}
                    </Badge>
                  </div>

                  {/* Dates Section */}
                  <div className="text-sm space-y-1">
                    {d?.started_at && (
                      <div>
                        <span className="font-medium">Started:</span>{" "}
                        {parseDate(d.started_at)}
                      </div>
                    )}
                    {d?.ended_at && (
                      <div>
                        <span className="font-medium">Ended:</span>{" "}
                        {parseDate(d.ended_at)}
                      </div>
                    )}
                    {d?.go_live_at && (
                      <div>
                        <span className="font-medium">Go Live:</span>{" "}
                        {parseDate(d.go_live_at)}
                      </div>
                    )}
                  </div>

                  {d?.latest_comment && (
                    <>
                      <Separator />
                      {/* Latest Comment Section */}
                      <div className="space-y-1">
                        <div className="text-[14px]">
                          <p className="font-bold">Comment: </p>{" "}
                          <p className="text-[13px] whitespace-pre-line">
                            {d.latest_comment.content}
                          </p>
                        </div>
                        {d.latest_comment.author && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Author:</span>{" "}
                            {d.latest_comment.author.full_name}
                          </div>
                        )}
                        {d.latest_comment.updated_at && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Updated:</span>{" "}
                            {parseDate(d.latest_comment.updated_at)}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </HoverCardContent>
            </HoverCard>
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
            <span className="whitespace-normal wrap-break-word">
              {Number(dueDays) > 0 && (
                <Hint label={`Overdue by ${dueDays} days`}>
                  <ClockAlert className="inline mr-1 text-amber-500 w-4" />
                </Hint>
              )}
              {isAppAi && (
                <Hint label="AI Application">
                  <Bot
                    strokeWidth={3}
                    className="inline mr-1 text-purple-500 w-4"
                  />
                </Hint>
              )}
              {isAppPrivacy && (
                <Hint label="Privacy Application">
                  <ShieldPlus
                    strokeWidth={4}
                    className="inline mr-1 text-indigo-400 w-4"
                  />
                </Hint>
              )}
              {getValue()}
            </span>
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
            <HoverCard openDelay={100} closeDelay={200}>
              <HoverCardTrigger asChild>
                <div className=" w-full pl-4  ">
                  <span className="hover:cursor-default hover:border-gray-200 hover:border-3 border rounded-xl">
                    <Badge
                      className={`capitalize ${status === "go_live" ? "border-2  border-gray-500  rounded-xl" : ""}`}
                      style={{
                        backgroundColor: STATUS_COLOR_MAP_BG[status],
                        color: STATUS_COLOR_MAP_FG[status],
                      }}
                    >
                      {parseStatus(status)}
                    </Badge>
                  </span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-lg space-y-2" side="top">
                <h2 className="test-lg font-bold">Executive Summary</h2>
                <Separator />
                {info.row.original?.latest_executive_summary ? (
                  <ExecSummaryItem
                    execSummary={info.row.original.latest_executive_summary}
                  />
                ) : (
                  "No Data Added"
                )}
              </HoverCardContent>
            </HoverCard>
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
        cell: ({ row }) => {
          const rawStartDate = row.original.started_at; // "2026-01-11"
          const rawEndDate = row.original.completed_at;

          if (rawStartDate && !rawEndDate) {
            return (
              <div className="w-full">
                <p>Started: {parseDate(rawStartDate)}</p>
                <p className="text-muted-foreground">
                  {daysBetweenDateAndToday(rawStartDate)} Days ago
                </p>
              </div>
            );
          } else if (rawStartDate && rawEndDate) {
            const duration = daysBetweenDates(rawStartDate, rawEndDate);
            return (
              <div className="w-full">
                <p>
                  {parseDate(rawStartDate)} - {parseDate(rawEndDate)}
                </p>
                <p className="text-muted-foreground">{duration} Days</p>
              </div>
            );
          } else {
            return <span>-</span>;
          }
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
